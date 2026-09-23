/**
 * ParadropEffect — 伞兵超武特效（运输机飞入 → 沿途投伞兵 → 掉头离场）。
 *
 * 状态机 Spawning → EnRoute → Dropping → TurningAround：
 *  - Spawning：spawnDelay 倒计时后，在地图角点与目标之间算 bresenham
 *    航线，刷出运输机并 MoveTask 飞往目标；
 *  - EnRoute：进入 paradropRadius 转 Dropping；
 *  - Dropping：每 tick 尝试在空闲 subCell 投一名步兵（Paradrop stance、
 *    可选老兵）；无法落地且在界内累计失败 >5 次则放弃；
 *  - TurningAround：返回航线 toTile，到位后结束。
 *
 * 由 game/superweapon/ParadropEffect.ts.js 重写为 TS（行为完全一致，
 * 枚举值脚本提取自原文件）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换
import { ObjectType } from "engine/type/ObjectType"; // 已转换
import { Infantry } from "game/gameobject/Infantry"; // 已转换
import { StanceType } from "game/gameobject/infantry/StanceType"; // 已转换
import { MoveTask } from "game/gameobject/task/move/MoveTask"; // 已转换
import { ParadropTask } from "game/gameobject/task/ParadropTask"; // 已转换
import { UnlandableTrait } from "game/gameobject/trait/UnlandableTrait"; // 已转换
import { FacingUtil } from "game/gameobject/unit/FacingUtil"; // 已转换
import * as RangeHelperModule from "game/gameobject/unit/RangeHelper"; // 未转换（any-shim）
import { VeteranLevel } from "game/gameobject/unit/VeteranLevel"; // 已转换
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import { GameSpeed } from "game/GameSpeed"; // 已转换
import { RadialTileFinder } from "game/map/tileFinder/RadialTileFinder"; // 已转换
import { Vector2 } from "game/math/Vector2"; // 已转换
import { bresenham } from "util/bresenham"; // 已转换
import { SuperWeaponEffect } from "game/superweapon/SuperWeaponEffect"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 伞兵效果阶段（模块内状态机，不对外导出——与孪生一致）。 */
enum ParadropState {
  /** 等待起飞延迟。 */
  Spawning = 0,
  /** 运输机在途。 */
  EnRoute = 1,
  /** 投放中。 */
  Dropping = 2,
  /** 掉头返回。 */
  TurningAround = 3,
}

/** 单趟最长挂起时间（5 秒）。 */
const MAX_EFFECT_TICKS = 5 * GameSpeed.BASE_TICKS_PER_SECOND;

/** 伞兵编队规则（inf + num）。 */
export interface ParadropSquad {
  inf: string;
  num: number;
}

export class ParadropEffect extends SuperWeaponEffect {
  /** 伞兵编队。 */
  private paradropSquad: ParadropSquad;
  /** 当前阶段。 */
  private state: ParadropState;
  /** 落地失败次数。 */
  private failedAttempts: number;
  /** 起飞前延迟倒数。 */
  private spawnDelay: number;
  /** 步兵规则。 */
  private passengerRules: any;
  /** 剩余未投人数。 */
  private passengerCount: number;
  /** 目标落点。 */
  private targetTile: any;
  /** 运输机。 */
  private pdPlane: any;

  constructor(
    type: any,
    owner: any,
    tile: any,
    paradropSquad: ParadropSquad,
    spawnDelaySeconds: number,
  ) {
    super(type, owner, tile);
    this.paradropSquad = paradropSquad;
    this.state = ParadropState.Spawning;
    this.failedAttempts = 0;
    this.spawnDelay = spawnDelaySeconds * MAX_EFFECT_TICKS;
    this.passengerRules = undefined;
    // 孪生不在构造里初始化 passengerCount（onStart 才赋值）
    this.targetTile = undefined;
    this.pdPlane = undefined;
  }

  onStart(world: any): void {
    this.passengerRules = world.rules.getObject(this.paradropSquad.inf, ObjectType.Infantry);
    this.passengerCount = this.paradropSquad.num;
  }

  /**
   * 从 dest 反推入场点：沿 dest→src 反向延长 paradropRadius 后 bresenham
   * 取仍在硬边界内的首尾 tile。
   */
  computeFlightPath(src: Vector2, dest: Vector2, world: any): { fromTile: any; toTile: any } {
    if (dest.equals(src)) throw new Error("Source and destination must be different");
    const dir = src.clone().sub(dest);
    const extend = world.rules.general.paradrop.paradropRadius / Coords.LEPTONS_PER_TILE;
    const far = dest
      .clone()
      .add(dir.clone().setLength(dir.length() + 2 * extend))
      .floor();
    let path = bresenham(dest.x, dest.y, far.x, far.y).map(
      (p) => world.map.tiles.getByMapCoords(p.x, p.y) ?? world.map.tiles.getPlaceholderTile(p.x, p.y),
    );
    while (path.length) {
      const t = path[0];
      const worldPos = Coords.tileToWorld(t.rx + 0.5, t.ry + 0.5);
      if (world.map.isWithinHardBounds(new Vector2(worldPos.x, worldPos.y))) break;
      path.shift();
    }
    if (!path.length) throw new Error("No valid paradrop path found");
    return { fromTile: path[0], toTile: path[path.length - 1] };
  }

  onTick(world: any): boolean {
    if (this.state === ParadropState.Spawning) {
      if (0 < this.spawnDelay) {
        this.spawnDelay--;
        return false;
      }
      const mapSize = world.map.tiles.getMapSize();
      const edge = [
        new Vector2(0, 0),
        new Vector2(Math.floor(mapSize.width / 2), 0),
        new Vector2(0, Math.floor(mapSize.height / 2)),
      ][world.generateRandomInt(0, 2)];
      const walkSpeed = this.passengerRules.speedType;
      const finder = new RadialTileFinder(
        world.map.tiles,
        world.map.mapBounds,
        this.tile,
        { width: 1, height: 1 },
        0,
        50,
        (t: any) => 0 < world.map.terrain.getPassableSpeed(t, walkSpeed, true, !!t.onBridgeLandType),
      );
      const target = (this.targetTile = finder.getNextTile());
      if (!target) return true;
      const targetVec = new Vector2(target.rx, target.ry);
      const { fromTile, toTile } = this.computeFlightPath(targetVec, edge, world);
      const planeName = world.rules.general.paradrop.paradropPlane;
      const planeRules = world.rules.getObject(planeName, ObjectType.Aircraft);
      const plane = (this.pdPlane = world.createUnitForPlayer(planeRules, this.owner));
      world.spawnObject(plane, fromTile);
      plane.direction = FacingUtil.fromMapCoords(
        targetVec.clone().sub(new Vector2(fromTile.rx, fromTile.ry)),
      );
      plane.position.tileElevation = Coords.worldToTileHeight(
        plane.rules.flightLevel ?? world.rules.general.flightLevel,
      );
      plane.zone = ZoneType.Air;
      plane.onBridge = false;
      plane.unitOrderTrait.addTask(
        new MoveTask(world, toTile, false, { allowOutOfBoundsTarget: true }),
      );
      plane.traits.get(UnlandableTrait).setEnabled(false);
      this.state = ParadropState.EnRoute;
    }
    if (!this.pdPlane || this.pdPlane.isDestroyed || this.pdPlane.isCrashing) return true;
    const dest = this.targetTile;
    if (!this.pdPlane.unitOrderTrait.hasTasks()) {
      this.state = ParadropState.TurningAround;
      this.pdPlane.unitOrderTrait.addTask(
        new MoveTask(world, dest, false, { allowOutOfBoundsTarget: true }),
      );
      return false;
    }
    const dropRadius = world.rules.general.paradrop.paradropRadius / Coords.LEPTONS_PER_TILE;
    const helper = new RangeHelperModule.RangeHelper(world.map.tileOccupation);
    const inRange = helper.isInTileRange(this.pdPlane.tile, dest, 0, dropRadius);
    if (this.state === ParadropState.EnRoute && inRange) this.state = ParadropState.Dropping;
    if (this.state === ParadropState.Dropping) {
      if (inRange && 0 < this.passengerCount) {
        const dropTile = this.pdPlane.tile;
        const onBridge = !!dropTile.onBridgeLandType;
        if (5 < this.failedAttempts && world.map.mapBounds.isWithinBounds(dropTile)) {
          this.passengerCount = 0;
          return false;
        }
        if (!world.map.terrain.getPassableSpeed(dropTile, this.passengerRules.speedType, true, onBridge)) {
          return false;
        }
        const ground = world.map.getGroundObjectsOnTile(dropTile);
        if (
          ground.some(
            (o: any) =>
              (o.isVehicle() && o.onBridge === onBridge) ||
              (o.isBuilding() && !o.isDestroyed) ||
              (o.isInfantry() && o.stance === StanceType.Paradrop),
          )
        ) {
          return false;
        }
        const subCell = this.findFreeSubCell(world, dropTile);
        if (!subCell) return false;
        this.passengerCount--;
        const unit = world.createUnitForPlayer(this.passengerRules, this.owner);
        unit.stance = StanceType.Paradrop;
        unit.position.tileElevation = this.pdPlane.tileElevation;
        unit.position.subCell = subCell;
        unit.onBridge = onBridge;
        if (unit.rules.trainable && this.owner.canProduceVeteran(unit.rules)) {
          unit.veteranTrait?.setVeteranLevel(VeteranLevel.Veteran);
        }
        world.spawnObject(unit, dropTile);
        unit.unitOrderTrait.addTask(new ParadropTask(world).setCancellable(false));
      } else {
        if (!(0 < this.passengerCount)) {
          this.pdPlane.unitOrderTrait.getCurrentTask().forceCancel(this.pdPlane);
          this.pdPlane.traits.get(UnlandableTrait).setEnabled(true);
          return true;
        }
        this.failedAttempts++;
        this.state = ParadropState.TurningAround;
        this.pdPlane.unitOrderTrait
          .getCurrentTask()
          .updateTarget(dest, !!dest.onBridgeLandType);
      }
    }
    if (
      this.state === ParadropState.TurningAround &&
      inRange
    ) {
      const turned = this.computeFlightPath(
        new Vector2(dest.rx, dest.ry),
        new Vector2(this.pdPlane.tile.rx, this.pdPlane.tile.ry),
        world,
      )["toTile"];
      this.pdPlane.unitOrderTrait.getCurrentTask().updateTarget(turned, false);
      this.state = ParadropState.EnRoute;
    }
    return false;
  }

  /** 在落点找一个未被地形地基占用的 subCell；多人时随机取一个。 */
  private findFreeSubCell(world: any, tile: any): number | undefined {
    const occupied = world.map
      .getGroundObjectsOnTile(tile)
      .filter((o: any) => o.isTerrain())
      .map((o: any) => o.rules.getOccupiedSubCells(world.map.getTheaterType()))
      .flat();
    const free = Infantry.SUB_CELLS.filter((cell: number) => -1 === occupied.indexOf(cell));
    if (free.length) {
      return free.length > 1 ? free[world.generateRandomInt(0, free.length - 1)] : free[0];
    }
    return undefined;
  }
}
