/**
 * ReturnOreTask — 车辆矿车返程卸货任务。
 *
 * 状态机（由 harvesterTrait.status 驱动）：
 *  - MovingToRefinery：选精炼厂（forceTarget 优先，否则最近可达且
 *    dock 可用/岛屿连通的精炼厂）；无厂 → LookingForRefinery；
 *    有空 dock 且不太远时预占 dock 并严格走到 docking tile
 *    （teleporter 用 TeleportMoveToRefineryTask）；否则先去排队格等待；
 *  - Docking：朝向 270 停妥后 dockUnitAt 入位；
 *  - PreparingToUnload：禁止机会开火，等 2 游戏分钟后进入 Unloading；
 *  - Unloading：按 bails × 矿石单价计价，有电的 orePurifier 按
 *    purifierBonus 加成，AI 按难度 ×2/×1.5，入账 credits 并累计
 *    _refineryOrePile（渲染 GAREFNOR 矿石到达动画），清空货仓后
 *    队列仅剩本任务时追加 GatherOreTask；
 *  - onEnd：已占位时 undock/unreserve，非 LookingForRefinery 置 Idle。
 *
 * chronoMinerCanTeleport：距离在 (1, chronoHarvTooFarDistance] 且目标
 * 精炼厂仍有效、dock 未占满（或本单位已预留）时才允许超时空传送。
 *
 * 由 game/gameobject/task/harvester/ReturnOreTask.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标。
 */
import { Task } from "game/gameobject/task/system/Task"; // 已转换
import * as RangeHelperModule from "game/gameobject/unit/RangeHelper"; // 未转换（any-shim）
import { RadialTileFinder } from "game/map/tileFinder/RadialTileFinder"; // 已转换
import { MoveTask } from "game/gameobject/task/move/MoveTask"; // 已转换
import { TurnTask } from "game/gameobject/task/TurnTask"; // 已转换
import { WaitMinutesTask } from "game/gameobject/task/system/WaitMinutesTask"; // 已转换
import { HarvesterStatus } from "game/gameobject/trait/HarvesterTrait"; // 已转换
import * as TeleportMoveToRefineryTaskModule from "game/gameobject/task/harvester/TeleportMoveToRefineryTask"; // 已转换
import * as GatherOreTaskModule from "game/gameobject/task/harvester/GatherOreTask"; // 已转换
import { CallbackTask } from "game/gameobject/task/system/CallbackTask"; // 已转换
import { MoveResult } from "game/gameobject/trait/MoveTrait"; // 已转换
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import { Vector2 } from "game/math/Vector2"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ReturnOreTask extends Task {
  game: any;
  /** 强制卸货的精炼厂（可选；优先于自动寻厂）。 */
  forceTarget: any;
  /** onStart 时清空 lastOreSite（重新找矿）。 */
  resetLastOreSite: boolean;
  /** 玩家显式下令返程（忽略 harvesterTooFarDistance 距离门槛）。 */
  explicitOrder: boolean;
  useChildTargetLines: boolean;
  preventOpportunityFire: boolean;
  rangeHelper: any;
  /** 当前目标精炼厂（孪生构造函数未赋值，运行时写入）。 */
  target: any;
  /** 本单位预留的 dock 编号（孪生构造函数未赋值，入位后清空）。 */
  reservedDockNumber: any;

  constructor(game: any, forceTarget?: any, resetLastOreSite = false, explicitOrder = false) {
    super();
    this.game = game;
    this.forceTarget = forceTarget;
    this.resetLastOreSite = resetLastOreSite;
    this.explicitOrder = explicitOrder;
    this.useChildTargetLines = true;
    this.preventOpportunityFire = false;
    this.rangeHelper = new RangeHelperModule.RangeHelper(game.map.tileOccupation);
  }

  onStart(object: any): void {
    if (!object.isVehicle() || !object.harvesterTrait) throw new Error(`Unit ${object.name} is not a harvester.`);
    object.harvesterTrait.status = HarvesterStatus.MovingToRefinery;
    if (this.resetLastOreSite) object.harvesterTrait.lastOreSite = undefined;
  }

  onEnd(object: any): void {
    if (this.target?.isSpawned) {
      this.target.dockTrait.undockUnit(object);
      this.target.dockTrait.unreserveDockForUnit(object);
    }
    if (object.harvesterTrait.status !== HarvesterStatus.LookingForRefinery) {
      object.harvesterTrait.status = HarvesterStatus.Idle;
    }
  }

  onTick(object: any): boolean {
    if (this.isCancelling()) return true;
    const harvester = object.harvesterTrait;
    if (harvester.status === HarvesterStatus.LookingForRefinery) return true;
    if (harvester.status === HarvesterStatus.MovingToRefinery) {
      if (
        !this.target ||
        !this.isValidTargetRefinery(this.target, object) ||
        object.tile !== this.findRefineryDockingTile(this.target)
      ) {
        const refinery = this.forceTarget ?? this.findClosestReachableRefinery(object);
        if (!refinery) {
          harvester.status = HarvesterStatus.LookingForRefinery;
          return true;
        }
        if (this.target && this.target !== refinery && this.target.dockTrait.hasReservedDockForUnit(object)) {
          this.target.dockTrait.unreserveDockForUnit(object);
        }
        this.target = refinery;
      }
      let dockNumber = this.target.dockTrait.getFirstAvailableDockNumber();
      let needQueue = false;
      if (dockNumber === undefined) {
        dockNumber = this.target.dockTrait.getFirstEmptyDockNumber();
        if (dockNumber !== undefined) needQueue = !this.target.dockTrait.hasReservedDockForUnit(object);
      }
      const dockTile = this.findRefineryDockingTile(this.target);
      const dist = this.rangeHelper.tileDistance(object, dockTile);
      if (
        dockNumber === undefined ||
        needQueue ||
        (dist > this.game.rules.general.harvesterTooFarDistance && !this.explicitOrder)
      ) {
        const queueTile = this.findReachableQueueingTile(object);
        if (!queueTile) return true;
        if (object.tile !== queueTile) {
          this.children.push(
            object.rules.teleporter
              ? new TeleportMoveToRefineryTaskModule.TeleportMoveToRefineryTask(
                  this.game,
                  dockTile,
                  queueTile,
                  () => this.chronoMinerCanTeleport(object, dockTile, this.target),
                )
              : new MoveTask(this.game, queueTile, false),
            new CallbackTask(() => {
              if (object.moveTrait.lastMoveResult === MoveResult.Fail) {
                harvester.status = HarvesterStatus.LookingForRefinery;
              } else if (object.moveTrait.lastMoveResult === MoveResult.CloseEnough) {
                this.children.push(new WaitMinutesTask(5 / 60));
              } else if (object.moveTrait.lastMoveResult === MoveResult.Success) {
                this.children.push(new WaitMinutesTask(2 / 60));
              }
            }),
          );
        }
        return false;
      }
      if (!this.target.dockTrait.hasReservedDockForUnit(object)) {
        this.target.dockTrait.reserveDockAt(object, dockNumber);
      }
      if (this.reservedDockNumber === undefined) {
        this.reservedDockNumber = this.target.dockTrait.getReservedDockForUnit(object);
      }
      if (object.tile !== dockTile) {
        this.children.push(
          object.rules.teleporter
            ? new TeleportMoveToRefineryTaskModule.TeleportMoveToRefineryTask(this.game, dockTile, undefined, () =>
                this.chronoMinerCanTeleport(object, dockTile, this.target),
              )
            : new MoveTask(this.game, dockTile, false, { closeEnoughTiles: 0, strictCloseEnough: true }),
          new CallbackTask(() => {
            if (object.moveTrait.lastMoveResult === MoveResult.Fail) {
              harvester.status = HarvesterStatus.LookingForRefinery;
            }
          }),
        );
        return false;
      }
      harvester.status = HarvesterStatus.Docking;
    }
    if (!this.isValidTargetRefinery(this.target, object)) {
      harvester.status = HarvesterStatus.MovingToRefinery;
      this.forceTarget = undefined;
      return this.onTick(object);
    }
    if (harvester.status === HarvesterStatus.Docking) {
      if (object.direction !== 270) {
        this.children.push(new TurnTask(270));
        return false;
      }
      this.target.dockTrait.dockUnitAt(object, this.reservedDockNumber);
      this.reservedDockNumber = undefined;
      harvester.status = HarvesterStatus.PreparingToUnload;
    }
    if (harvester.status === HarvesterStatus.PreparingToUnload) {
      this.preventOpportunityFire = true;
      this.children.push(new WaitMinutesTask(2 / 60));
      harvester.status = HarvesterStatus.Unloading;
      return false;
    }
    if (harvester.status !== HarvesterStatus.Unloading) return false;
    const baseValue = harvester
      .getBails()
      .reduce((sum: number, [type, count]: any[]) => sum + count * this.game.rules.getTiberium(type).value, 0);
    let credits = baseValue;
    const purifierCount = [...this.target.owner.buildings].filter(
      (b: any) =>
        b.rules.orePurifier && (!b.poweredTrait || !this.target.owner.powerTrait?.isLowPower()),
    ).length;
    const purifierBonus = this.game.rules.general.purifierBonus;
    credits += purifierCount * Math.floor(baseValue * purifierBonus);
    if (this.target.owner.isAi) {
      credits =
        this.target.owner.aiDifficulty === 0
          ? Math.floor(credits * 2)
          : this.target.owner.aiDifficulty === 1
            ? Math.floor(credits * 1.5)
            : credits;
    }
    this.target.owner.credits += credits;
    this.target.owner.creditsGained += credits;
    // 精炼厂倒矿触发——累计本次倒矿量（原始矿石值 baseValue，可为零）。
    // 渲染器据此按「矿量/满矿」比例播放 GAREFNOR「矿石到达」动画。
    if (this.target.rules.refinery) {
      this.target._refineryOrePile = (this.target._refineryOrePile ?? 0) + baseValue;
    }
    harvester.empty();
    if (object.unitOrderTrait.getTasks().length === 1) {
      object.unitOrderTrait.addTask(new GatherOreTaskModule.GatherOreTask(this.game));
    }
    return true;
  }

  /** 精炼厂仍可用：已 spawn、与单位友好、未被超时空力场罩住。 */
  isValidTargetRefinery(refinery: any, object: any): boolean {
    return refinery.isSpawned && this.game.areFriendly(refinery, object) && !refinery.warpedOutTrait.isActive();
  }

  /** 在己方建筑里选可达精炼厂：优先有空 dock 的，否则最近的。 */
  findClosestReachableRefinery(unit: any): any {
    const rangeHelper = this.rangeHelper;
    const isAir = unit.zone === ZoneType.Air;
    const speedType = unit.rules.speedType;
    const isInfantry = unit.isInfantry();
    const islandMap =
      !isAir && this.game.map.terrain.getPassableSpeed(unit.tile, speedType, isInfantry, unit.onBridge)
        ? this.game.map.terrain.getIslandIdMap(speedType, isInfantry)
        : undefined;
    const candidates = [...unit.owner.buildings]
      .filter(
        (b: any) =>
          b.rules.refinery &&
          b.dockTrait &&
          !b.warpedOutTrait.isActive() &&
          ((dockTile: any) => unit.rules.teleporter || islandMap?.get(dockTile, false) === islandMap?.get(unit.tile, unit.onBridge))(
            this.findRefineryDockingTile(b),
          ),
      )
      .sort((a: any, b: any) => rangeHelper.distance2(unit, a) - rangeHelper.distance2(unit, b));
    const nearest = candidates[0];
    const withFreeDock = candidates.find((b: any) => 0 < b.dockTrait.getAvailableDockCount());
    if (
      !withFreeDock ||
      (nearest &&
        rangeHelper.tileDistance(unit, withFreeDock.centerTile) -
          rangeHelper.tileDistance(unit, nearest.centerTile) >
          this.game.rules.general.harvesterTooFarDistance)
    ) {
      return nearest;
    }
    return withFreeDock;
  }

  /** 精炼厂旁排队格：优先 art.queueingCell，否则地基外环第一格。 */
  findReachableQueueingTile(unit: any): any {
    if (this.target.art.queueingCell) {
      const queueLeptons = new Vector2(this.target.tile.rx, this.target.tile.ry).add(this.target.art.queueingCell);
      const queueTile = this.game.map.tiles.getByMapCoords(queueLeptons.x, queueLeptons.y);
      if (queueTile && this.isValidQueueingTile(queueTile, unit)) return queueTile;
    }
    return new RadialTileFinder(
      this.game.map.tiles,
      this.game.map.mapBounds,
      this.target.tile,
      this.target.getFoundation(),
      1,
      1,
      (tile: any) => this.isValidQueueingTile(tile, unit),
    ).getNextTile();
  }

  /** 排队格合法：飞行单位恒真；地面同岛、高差 <2、非桥面。 */
  isValidQueueingTile(tile: any, unit: any): boolean {
    const isAir = unit.zone === ZoneType.Air;
    const speedType = unit.rules.speedType;
    const isInfantry = unit.isInfantry();
    const islandMap =
      !isAir && this.game.map.terrain.getPassableSpeed(unit.tile, speedType, isInfantry, unit.onBridge)
        ? this.game.map.terrain.getIslandIdMap(speedType, isInfantry)
        : undefined;
    return (
      isAir ||
      (islandMap?.get(tile, false) === islandMap?.get(unit.tile, unit.onBridge) &&
        Math.abs(tile.z - this.target.tile.z) < 2 &&
        !tile.onBridgeLandType)
    );
  }

  /** 精炼厂卸货 dock tile：地基右缘中点。 */
  findRefineryDockingTile(refinery: any): any {
    const coords = {
      x: refinery.tile.rx + refinery.getFoundation().width - 1,
      y: refinery.tile.ry + Math.floor(refinery.getFoundation().height / 2),
    };
    return this.game.map.tiles.getByMapCoords(coords.x, coords.y);
  }

  /** 超时空矿车能否传送到 dockTile（见类注释条件）。 */
  chronoMinerCanTeleport(unit: any, dockTile: any, target: any): boolean {
    const rangeHelper = this.rangeHelper;
    const dist = rangeHelper.tileDistance(unit, dockTile);
    return (
      !(!this.forceTarget && dist > this.game.rules.general.chronoHarvTooFarDistance) &&
      !(dist <= 1) &&
      !!this.isValidTargetRefinery(target, unit) &&
      !(target.dockTrait.getAvailableDockCount() === 0 && !target.dockTrait.hasReservedDockForUnit(unit))
    );
  }
}
