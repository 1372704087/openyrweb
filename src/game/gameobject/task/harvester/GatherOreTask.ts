/**
 * GatherOreTask — 车辆矿车采集矿石任务。
 *
 * 状态机（由 harvesterTrait.status 驱动）：
 *  - MovingToOreSite：在 initialTarget / lastOreSite / 当前格附近找最近
 *    可达矿石格（飞兵跳过岛屿检查；近距环优先高价值矿）；找不到矿时
 *    转 LookingForOreSite，若脚下是精炼厂且队列里只有本任务，则先挪到
 *    精炼厂旁空位；找到矿则挂 MoveTask 走过去（closeEnough 等于
 *    general.closeEnough；被挡时 forceMove 严格靠近一次）；
 *  - Harvesting：脚下有矿石覆盖物则 collectBail 入仓（最后一捆返回
 *    undefined 不入账，与孪生一致），矿堆采空 unspawn；装满或无矿
 *    且有货 → returnOreIfPossible 返程；矿主有精炼厂或显式下令则继续
 *    采，否则任务结束；
 *  - onEnd：非 LookingForOreSite 时把状态置回 Idle。
 *
 * 近距找矿用 3×3 偏好矩阵（价值 > 矿量 > 方位）在距离 1 的邻格中挑。
 *
 * 由 game/gameobject/task/harvester/GatherOreTask.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标。
 */
import { Task } from "game/gameobject/task/system/Task"; // 已转换
import { RadialTileFinder } from "game/map/tileFinder/RadialTileFinder"; // 已转换
import { HarvesterStatus } from "game/gameobject/trait/HarvesterTrait"; // 已转换
import { LandType } from "game/type/LandType"; // 已转换
import { MoveTask } from "game/gameobject/task/move/MoveTask"; // 已转换
import * as TiberiumTraitModule from "game/gameobject/trait/TiberiumTrait"; // 未转换（any-shim）
import { WaitMinutesTask } from "game/gameobject/task/system/WaitMinutesTask"; // 已转换
import * as ReturnOreTaskModule from "game/gameobject/task/harvester/ReturnOreTask"; // 已转换
import * as RangeHelperModule from "game/gameobject/unit/RangeHelper"; // 未转换（any-shim）
import { CallbackTask } from "game/gameobject/task/system/CallbackTask"; // 已转换
import { MoveResult } from "game/gameobject/trait/MoveTrait"; // 已转换
import { MovementZone } from "game/type/MovementZone"; // 已转换

/** 近距找矿的 3×3 方位偏好矩阵（相对中心格的 ry/rx 偏移 → 权重）。 */
const ORE_SITE_PREFERENCE = [
  [8, 5, 6],
  [3, 0, 2],
  [7, 4, 1],
];

/* eslint-disable @typescript-eslint/no-explicit-any */
export class GatherOreTask extends Task {
  game: any;
  /** 下达任务时的初始矿点（可选；为矿石地皮时优先从这里找）。 */
  initialTarget: any;
  /** 是否玩家显式下令采集（影响无精炼厂时是否继续采）。 */
  explicitOrder: boolean;
  /** 严格 forceMove 已尝试过一次（防止无限重试）。 */
  forceMoveTried: boolean;
  useChildTargetLines: boolean;
  preventOpportunityFire: boolean;
  rangeHelper: any;
  /** 近距矿石扫描半径（rules.ai.tiberiumNearScan）。 */
  scanNearRadius: number;
  /** 远距矿石扫描半径（rules.ai.tiberiumFarScan）。 */
  scanFarRadius: number;
  /** 当前矿点 tile（孪生构造函数未赋值，运行时写入）。 */
  target: any;

  constructor(game: any, initialTarget?: any, explicitOrder = false) {
    super();
    this.game = game;
    this.initialTarget = initialTarget;
    this.explicitOrder = explicitOrder;
    this.forceMoveTried = false;
    this.useChildTargetLines = true;
    this.preventOpportunityFire = false;
    this.rangeHelper = new RangeHelperModule.RangeHelper(game.map.tileOccupation);
    this.scanNearRadius = game.rules.ai.tiberiumNearScan;
    this.scanFarRadius = game.rules.ai.tiberiumFarScan;
  }

  onStart(object: any): void {
    if (!object.isVehicle() || !object.harvesterTrait) throw new Error(`Unit ${object.name} is not a harvester.`);
    object.harvesterTrait.status = HarvesterStatus.MovingToOreSite;
    object.harvesterTrait.lastGatherExplicit = this.explicitOrder;
  }

  onEnd(object: any): void {
    if (object.harvesterTrait.status !== HarvesterStatus.LookingForOreSite) {
      object.harvesterTrait.status = HarvesterStatus.Idle;
    }
  }

  onTick(object: any): boolean {
    if (this.isCancelling()) return true;
    const harvester = object.harvesterTrait;
    if (harvester.status === HarvesterStatus.MovingToOreSite) {
      const prevTarget = this.target;
      // 已有目标 / initialTarget 不是矿石地皮时，从 lastOreSite 或当前格起搜；
      // 仅当无目标且 initialTarget 是矿石地皮时，才以 initialTarget 为搜索中心。
      const searchCenter =
        this.target || this.initialTarget?.landType !== LandType.Tiberium
          ? (harvester.lastOreSite ?? object.tile)
          : this.initialTarget;
      this.target = this.findClosestReachableOreSite(object, searchCenter, true);
      harvester.lastOreSite = this.target;
      if (!this.target) {
        harvester.status = HarvesterStatus.LookingForOreSite;
        const refinery = this.getRefineryOnTile(object.tile);
        if (refinery && object.unitOrderTrait.getTasks().length === 1) {
          const isFly = object.rules.movementZone === MovementZone.Fly;
          const exitTile = new RadialTileFinder(
            this.game.map.tiles,
            this.game.map.mapBounds,
            refinery.tile,
            refinery.getFoundation(),
            1,
            5,
            (tile: any) =>
              isFly ||
              (0 < this.game.map.terrain.getPassableSpeed(tile, object.rules.speedType, object.isInfantry(), false) &&
                Math.abs(tile.z - object.tile.z) < 2 &&
                !this.game.map.terrain.findObstacles({ tile, onBridge: undefined }, object).length),
          ).getNextTile();
          if (exitTile) {
            object.unitOrderTrait.addTasks(
              new MoveTask(this.game, exitTile, false),
              new CallbackTask(() => {
                if (
                  ![MoveResult.Success, MoveResult.CloseEnough, MoveResult.Cancel].includes(
                    object.moveTrait.lastMoveResult,
                  )
                ) {
                  this.children.push(new WaitMinutesTask(1 / 60));
                }
              }),
            );
          }
        }
        return true;
      }
      const closeEnoughTiles = this.game.rules.general.closeEnough;
      const wasClose =
        prevTarget && this.rangeHelper.tileDistance(object.tile, this.target) <= closeEnoughTiles;
      if (!(object.tile === this.target || (object.tile.landType === LandType.Tiberium && wasClose))) {
        if (object.tile !== this.target && wasClose && object.tile.landType !== LandType.Tiberium) {
          const nearbyOre = this.findClosestReachableOreSite(object, object.tile, false, true);
          if (nearbyOre) {
            this.target = nearbyOre;
            harvester.lastOreSite = this.target;
          } else {
            if (!this.forceMoveTried) {
              this.forceMoveTried = true;
              this.children.push(
                new MoveTask(this.game, this.target, false, { closeEnoughTiles: 0, strictCloseEnough: true }),
              );
              return false;
            }
            this.forceMoveTried = false;
            if (!harvester.isEmpty()) {
              this.returnOreIfPossible(object);
              return true;
            }
            const fallbackOre = this.findClosestReachableOreSite(object, object.tile, true, true);
            if (!fallbackOre) {
              harvester.status = HarvesterStatus.LookingForOreSite;
              return true;
            }
            this.target = fallbackOre;
            harvester.lastOreSite = this.target;
          }
        }
        this.children.push(
          new MoveTask(this.game, this.target, false, { closeEnoughTiles: closeEnoughTiles }),
          new CallbackTask(() => {
            if (
              ![MoveResult.Success, MoveResult.CloseEnough, MoveResult.Cancel].includes(
                object.moveTrait.lastMoveResult,
              )
            ) {
              this.children.push(new WaitMinutesTask(5 / 60));
            }
          }),
        );
        return false;
      }
      // 已站上矿点（或 closeEnough 且脚下是矿）→ 开始采集。
      this.target = object.tile;
      harvester.lastOreSite = this.target;
      harvester.status = HarvesterStatus.Harvesting;
      this.forceMoveTried = false;
    }
    if (harvester.status !== HarvesterStatus.Harvesting) return false;
    if (harvester.isFull()) {
      this.returnOreIfPossible(object);
      return true;
    }
    const overlay = this.game.map
      .getObjectsOnTile(object.tile)
      .find((obj: any) => obj.isOverlay() && obj.isTiberium());
    if (!overlay) {
      if (this.findClosestReachableOreSite(object, object.tile, false) || harvester.isEmpty()) {
        harvester.status = HarvesterStatus.MovingToOreSite;
        return this.onTick(object);
      }
      this.returnOreIfPossible(object);
      return true;
    }
    const tibTrait = overlay.traits.get(TiberiumTraitModule.TiberiumTrait);
    const bailType = tibTrait.collectBail();
    // 与孪生一致：collectBail 对最后一捆返回 undefined，此时不入账；
    // 采空后 unspawn 矿石覆盖物。
    tibTrait.getBailCount() || this.game.unspawnObject(overlay);
    if (bailType !== undefined) harvester.addBails(bailType, 1);
    const keepGathering = [...object.owner.buildings].some((b: any) => b.rules.refinery) || this.explicitOrder;
    if (keepGathering) {
      this.children.push(new WaitMinutesTask(1 / 60));
      return false;
    }
    return true;
  }

  /**
   * 找最近可达矿石格。
   * useFarRadius=false：先在中心距离 1 的矿格里按「矿值 > 矿量 > 方位
   * 偏好矩阵」排序取最优；没有再按 near 半径径向扫。
   * useFarRadius=true：直接按 far 半径径向扫。
   * avoidObstacles=true 时额外要求格子无阻挡。
   */
  findClosestReachableOreSite(unit: any, centerTile: any, useFarRadius: any, avoidObstacles = false): any {
    const isFly = unit.rules.movementZone === MovementZone.Fly;
    const speedType = unit.rules.speedType;
    const isInfantry = unit.isInfantry();
    const islandMap =
      !isFly && this.game.map.terrain.getPassableSpeed(unit.tile, speedType, isInfantry, unit.onBridge)
        ? this.game.map.terrain.getIslandIdMap(speedType, isInfantry)
        : undefined;
    const homeIsland = islandMap?.get(unit.tile, unit.onBridge);
    const predicate = (tile: any) =>
      tile.landType === LandType.Tiberium &&
      islandMap?.get(tile, false) === homeIsland &&
      (!avoidObstacles || isFly || !this.game.map.terrain.findObstacles({ tile, onBridge: undefined }, unit).length);
    if (predicate(centerTile)) return centerTile;
    let minDistance = 1;
    if (!useFarRadius) {
      const ringFinder = new RadialTileFinder(
        this.game.map.tiles,
        this.game.map.mapBounds,
        centerTile,
        { width: 1, height: 1 },
        minDistance,
        minDistance,
        predicate,
      );
      const ringTiles: any[] = [];
      for (;;) {
        const tile = ringFinder.getNextTile();
        if (!tile) break;
        ringTiles.push(tile);
      }
      if (ringTiles.length) {
        const scored = ringTiles.map((tile: any) => {
          const ore = this.game.map
            .getObjectsOnTile(tile)
            .find((obj: any) => obj.isOverlay() && obj.isTiberium());
          if (!ore) throw new Error(`Ore should exist on tile ${tile.rx},${tile.ry} b/c of landType`);
          const tibTrait = ore.traits.get(TiberiumTraitModule.TiberiumTrait);
          return { tile, ore, tibTrait };
        });
        scored.sort(
          (a: any, b: any) =>
            1e5 * (b.tibTrait.rules.value - a.tibTrait.rules.value) +
            1e3 * (b.ore.value - a.ore.value) +
            (ORE_SITE_PREFERENCE[1 + b.tile.ry - centerTile.ry][1 + b.tile.rx - centerTile.rx] -
              ORE_SITE_PREFERENCE[1 + a.tile.ry - centerTile.ry][1 + a.tile.rx - centerTile.rx]),
        );
        return scored[0].tile;
      }
      minDistance = 2;
    }
    const maxRadius = useFarRadius ? this.scanFarRadius : this.scanNearRadius;
    const finder = new RadialTileFinder(
      this.game.map.tiles,
      this.game.map.mapBounds,
      centerTile,
      { width: 1, height: 1 },
      minDistance,
      maxRadius,
      predicate,
    );
    return finder.getNextTile();
  }

  getRefineryOnTile(tile: any): any {
    return this.game.map.getObjectsOnTile(tile).find((obj: any) => obj.isBuilding() && obj.rules.refinery);
  }

  /** 队列里只有本任务时，追加 ReturnOreTask 返程卸货。 */
  returnOreIfPossible(object: any): void {
    if (object.unitOrderTrait.getTasks().length === 1) {
      object.unitOrderTrait.addTask(new ReturnOreTaskModule.ReturnOreTask(this.game));
    }
  }

  getTargetLinesConfig(_world: any): any {
    return { pathNodes: this.initialTarget ? [{ tile: this.initialTarget, onBridge: undefined }] : [] };
  }
}
