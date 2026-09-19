/**
 * JumpjetLocomotor — 跳跃机移动器（空中悬浮机动/坠毁轨迹/原地悬停降落）。
 *
 * 跳跃机（火箭飞行兵之外的空中载具，如武装直升机升空后）不在地面行走，
 * 而是始终悬浮在障碍物顶部 + jumpjetHeight 的高度上直线飞行：
 *  - tickStationary：静止悬停时判断能否降落到当前 tile（地面平坦/无障碍/
 *    有码头可停靠），能降则落地并派发 ObjectLandEvent，不能降则爬升悬停；
 *  - tick：空中机动主循环——垂直方向爬升/下降到巡航高度，水平方向
 *    每 tick +2 渐进加速到 jumpjetSpeed，转弯受 jumpjetTurnRate 限制；
 *    注意跳跃机无视路径途经点，直接朝最终目的地（destinationLeptons）飞；
 *  - tickCrash：被击落后的坠落——普通跳跃机直线下坠自旋，
 *    tiltCrashJumpjet 单位走螺旋轨道坠毁（边盘旋边俯冲）。
 *
 * tick 调用契约（见 MoveTask）：tick(object, currentWaypointLeptons,
 * destinationLeptons, isCancelled)——第 2 参途经点被故意忽略。
 *
 * 由 game/gameobject/locomotor/JumpjetLocomotor.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标。
 */
import { Coords } from "game/Coords"; // 已转换
import * as FacingUtilModule from "game/gameobject/unit/FacingUtil"; // 已转换
import { TargetUtil } from "game/gameobject/unit/TargetUtil"; // 已转换
import * as geometryModule from "util/geometry"; // 已转换
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import * as ObjectLiftOffEventModule from "game/event/ObjectLiftOffEvent"; // 未转换（any-shim）
import * as ObjectLandEventModule from "game/event/ObjectLandEvent"; // 未转换（any-shim）
import { SpeedType } from "game/type/SpeedType"; // 已转换
import { StanceType } from "game/gameobject/infantry/StanceType"; // 已转换
import { Vector2 } from "game/math/Vector2"; // 已转换
import { Vector3 } from "game/math/Vector3"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class JumpjetLocomotor {
  // 字段一律不带初始化器：带初始化器会被 tsc 提到构造函数最前面，
  // 改变 Object.keys() 顺序（孪生只在构造函数里按上述顺序赋值）。
  game: any;
  allowOutOfBounds: boolean;
  /** 当前朝向对应的地图平面方向单位向量（随转向 tick 同步刷新）。 */
  currentMoveDir: Vector2;
  /** 当前水平飞行速度（leptons/tick），每 tick 渐进加速。 */
  currentHorizSpeed: number;
  /** 取消移动时的临时降落点（目标 tile 中心 + 原偏移），缓存避免重复计算。 */
  cancelDestLeptons: any;
  /** 上一次无障碍时的障碍高度，用于判断前方障碍是否突然升高（需要提前爬升）。 */
  lastClearZ: any;

  constructor(game: any) {
    this.game = game;
    this.allowOutOfBounds = true;
    this.currentMoveDir = new Vector2();
    this.currentHorizSpeed = 0;
  }

  /**
   * 静止悬停：每 tick 检查当前 tile 能否降落。
   * 可降落条件（全部满足）：
   *  - 非气球悬浮（balloonHover 单位永远悬空）；
   *  - 当前任务不阻止降落，或单位不具备 hoverAttack；
   *  - 且满足其一：该 tile 上有建筑物码头正停靠本单位（机坪降落），
   *    或地面可通行（非水域）+ 通行速度 > 0 + 无障碍物。
   * 可降落且已到达目标高度 → 落地：Zone 切回 Ground、派发 ObjectLandEvent、
   *   顺手拾取脚下的箱子；否则垂直移动向目标高度（地面或障碍顶+悬浮高）。
   */
  static tickStationary(object: any, world: any): void {
    if (object.zone !== ZoneType.Air) return;
    // 站在桥上时以桥面为地面参考。
    const bridge = object.tile.onBridgeLandType
      ? world.map.tileOccupation.getBridgeOnTile(object.tile)
      : undefined;
    const canLand =
      !object.rules.balloonHover &&
      (!object.unitOrderTrait.getCurrentTask()?.preventLanding || !object.rules.hoverAttack) &&
      (world.map.getGroundObjectsOnTile(object.tile).find(
        (obj: any) => obj.isBuilding() && obj.dockTrait?.isDocked(object),
      ) ||
        (world.map.getTileZone(object.tile) !== ZoneType.Water &&
          world.map.terrain.getPassableSpeed(object.tile, SpeedType.Foot, true, !!object.tile.onBridgeLandType) > 0 &&
          world.map.terrain.findObstacles({ tile: object.tile, onBridge: bridge }, object).length === 0));
    let targetY: number;
    if (canLand) {
      // 目标高度 = 地面（含桥面抬升）对应的世界高度。
      const groundZ = object.tile.z + (bridge?.tileElevation ?? 0);
      targetY = Coords.tileHeightToWorld(groundZ);
    } else {
      // 目标高度 = 路径上最高障碍（跳过空降中伞兵）顶部 + 悬浮高度。
      const maxObstacleHeight = object.tile.z +
        world.map
          .getGroundObjectsOnTile(object.tile)
          .filter((obj: any) => !(obj.isInfantry() && obj.stance === StanceType.Paradrop))
          .reduce((max: number, obj: any) => Math.max(max, obj.tileElevation + obj.art.height), 0);
      targetY = Coords.tileHeightToWorld(maxObstacleHeight) + object.rules.jumpjetHeight;
    }
    const currentY = object.position.worldPosition.y;
    if (targetY !== currentY) {
      // 垂直移动：向目标高度靠近，单 tick 最多 jumpjetClimb。
      let climb = object.rules.jumpjetClimb;
      const heightDiff = Math.abs(targetY - currentY);
      climb = Math.sign(targetY - currentY) * Math.min(climb, heightDiff);
      const prevElevation = object.tileElevation;
      object.position.moveByLeptons3(new Vector3(0, climb, 0));
      object.moveTrait.handleElevationChange(prevElevation, world);
    } else if (canLand) {
      // 高度已到位且可降落 → 正式落地。
      object.zone = ZoneType.Ground;
      object.onBridge = !!bridge;
      world.events.dispatch(new ObjectLandEventModule.ObjectLandEvent(object));
      // 落地点如果有箱子，直接拾取。
      const crate = world.map.tileOccupation
        .getGroundObjectsOnTile(object.tile)
        .find((obj: any) => obj.isOverlay() && obj.rules.crate);
      if (crate) world.crateGeneratorTrait.pickupCrate(object, crate, world);
    }
  }

  /**
   * 坠毁物理（被击落时由 MoveTrait 调用，每 tick 一次）。
   *  - 通用部分：机身自旋（direction 每 tick -6°）+ 固定下降率；
   *  - tiltCrashJumpjet（如武装直升机）：额外做 45° 机头俯冲姿态 +
   *    螺旋轨道坠落——以坠毁起点为圆心、3 倍下降率为半径盘旋下坠，
   *    角速度 8°/tick，同时把速度写入 moveTrait.velocity 供渲染插值。
   * 返回值：本 tick 的坠落位移向量（调用方负责应用）。
   */
  static tickCrash(object: any, _world: any, crashState: any): Vector3 {
    const fallRate = 2 * object.rules.jumpjetCrash;
    object.direction = (object.direction - 6 + 360) % 360;
    if (object.rules.tiltCrashJumpjet) {
      crashState.crashTick = (crashState.crashTick ?? 0) + 1;
      // 机头逐渐压低到 45°，前 20 tick 线性过渡。
      const maxTilt = 45;
      const tiltProgress = Math.min(1, crashState.crashTick / 20);
      object.crashPitch = maxTilt * tiltProgress;
      // 螺旋轨道参数只在首 tick 初始化（圆心/半径），之后保持不变。
      crashState.orbitCenter = crashState.orbitCenter ?? {
        x: object.position.worldPosition.x,
        z: object.position.worldPosition.z,
      };
      crashState.orbitRadius = crashState.orbitRadius ?? 3 * fallRate;
      crashState.orbitAngle = (crashState.orbitAngle ?? 0) + 8;
      // 由当前轨道角推出切线方向速度（v = ω × r），垂直分量固定下坠。
      const orbitRad = (crashState.orbitAngle * Math.PI) / 180;
      const omega = (8 * Math.PI) / 180;
      const vx = -crashState.orbitRadius * omega * Math.sin(orbitRad);
      const vz = crashState.orbitRadius * omega * Math.cos(orbitRad);
      const crashVelocity = new Vector3(vx, -fallRate, vz);
      if (object.moveTrait) object.moveTrait.velocity.copy(crashVelocity);
      return crashVelocity;
    }
    return new Vector3(0, -fallRate, 0);
  }

  /**
   * 新途经点回调（MoveTask 在选定路径点时调用）。
   * 跳跃机只关心自身朝向：把当前朝向换算成地图平面方向向量，
   * 并清空上一次的取消降落点缓存。
   */
  onNewWaypoint(object: any, _currentWaypointLeptons: any, _destinationLeptons: any): void {
    this.currentMoveDir = FacingUtilModule.FacingUtil.toMapCoords(object.direction);
    this.cancelDestLeptons = undefined;
  }

  /**
   * 每 tick 空中移动物理，返回 { distance 本 tick 位移, done 是否到达 }。
   * 流程：
   *  1. 首次进入空中 → 派发 ObjectLiftOffEvent；
   *  2. 任务取消中 → 改飞"取消降落点"（目标 tile 中心，去掉精确偏移）；
   *  3. 扫描前方 tile 算出最大障碍高度，决定垂直目标（障碍顶/悬浮高）；
   *  4. 垂直：低于爬升目标就爬升（水平速度清零），到位后进入巡航微调；
   *  5. 水平：朝向一致时全速直行；需要转弯时计算转弯圆——若目的地
   *     落在转弯圆内（转不过来）就停车调头，否则保持速度边转边飞；
   *  6. 距目的地不足一步（< jumpjetSpeed）视为到达。
   */
  tick(
    object: any,
    _currentWaypointLeptons: any,
    targetPos: any,
    isCancelled: any,
  ): { distance: Vector3; done: boolean } {
    if (object.zone !== ZoneType.Air) {
      object.onBridge = false;
      object.zone = ZoneType.Air;
      this.game.events.dispatch(new ObjectLiftOffEventModule.ObjectLiftOffEvent(object));
    }
    // 取消移动：飞向取消落点（目的地所在 tile 的中心 + 原偏移取整）。
    if (isCancelled) {
      if (!this.cancelDestLeptons) {
        let tile = object.tile;
        if (!this.game.map.isWithinBounds(tile)) tile = this.game.map.clampWithinBounds(tile);
        this.cancelDestLeptons = this.computeCancelDest(tile, targetPos);
      }
      targetPos = this.cancelDestLeptons;
    }
    const mapPos = object.position.getMapPosition();
    const toTarget = targetPos.clone().sub(mapPos);
    // 前方一 tile 范围内需要检查障碍的 tile 列表。
    const tilesToCheck = this.findTilesToCheckForBlockers(object.tile, mapPos, this.currentMoveDir, toTarget.length());
    // 路径上最大障碍高度 = max(tile.z + 地面物件顶高)，空降伞兵不算障碍。
    const maxObstacleHeight = tilesToCheck
      .map((tile: any) =>
        tile.z +
        this.game.map
          .getGroundObjectsOnTile(tile)
          .filter((obj: any) => !(obj.isDestroyed || (obj.isInfantry() && obj.stance === StanceType.Paradrop)))
          .reduce((max: number, obj: any) => Math.max(max, obj.tileElevation + obj.art.height), 0),
      )
      .reduce((a: number, b: number) => Math.max(a, b), 0);
    // 障碍比上次记录突增 2 格以上 → 额外多爬 4 格提前避让。
    let extraClearanceZ = 0;
    if (this.lastClearZ === undefined || maxObstacleHeight - this.lastClearZ > 2) extraClearanceZ = 4;
    const groundTargetY = Coords.tileHeightToWorld(maxObstacleHeight);
    const climbTargetY = Coords.tileHeightToWorld(maxObstacleHeight + extraClearanceZ);
    const currentY = object.position.worldPosition.y;
    const desiredFacing = FacingUtilModule.FacingUtil.fromMapCoords(toTarget);
    const reachedTargetDist = toTarget.length() < object.rules.jumpjetSpeed;
    let spinDelta = 0;
    // 高度已越过地面目标且未到终点 → 转向（水平机动前先对准方向）。
    if (groundTargetY <= currentY && !reachedTargetDist) {
      const facingResult = FacingUtilModule.FacingUtil.tick(object.direction, desiredFacing, object.rules.jumpjetTurnRate);
      spinDelta = facingResult.delta;
      object.direction = facingResult.facing;
      this.currentMoveDir.copy(FacingUtilModule.FacingUtil.toMapCoords(object.direction));
    }
    if (object.isVehicle()) object.spinVelocity = spinDelta;
    // verticalSettled：垂直方向是否已稳定（到达判定的一半）；
    // horizDone：水平方向是否完成（另一半）。
    let verticalSettled: boolean;
    let horizDone = false;
    let climbZ2 = 0;
    let horizontalSpeed = 0;
    const climbRate = object.rules.jumpjetClimb;
    if (currentY < climbTargetY) {
      // 还没爬到安全高度：全力爬升，水平速度清零（先升空再平飞）。
      climbZ2 = Math.min(climbRate, climbTargetY - currentY);
      verticalSettled = false;
      this.currentHorizSpeed = 0;
    } else {
      // 已到安全高度：记录无障碍高度，转入巡航（目标 = 障碍顶 + 悬浮高）。
      this.lastClearZ = maxObstacleHeight;
      const cruiseTargetY = groundTargetY + object.rules.jumpjetHeight;
      verticalSettled = true;
      if (cruiseTargetY !== currentY) {
        // 巡航高度微调（贴着障碍顶飞行），调整中不算稳定。
        const heightDiff = Math.abs(cruiseTargetY - currentY);
        climbZ2 = Math.sign(cruiseTargetY - currentY) * Math.min(climbRate, heightDiff);
        verticalSettled = heightDiff <= climbRate;
      }
      // 水平加速：每 tick +2，上限 jumpjetSpeed；prevHorizSpeed 为本 tick 实际可用速度。
      const prevHorizSpeed = this.currentHorizSpeed;
      this.currentHorizSpeed = Math.min(this.currentHorizSpeed + 2, object.rules.jumpjetSpeed);
      if (desiredFacing === object.direction) {
        // 朝向已对准：全速直行，剩余距离不足一 tick 速度即视为水平到位。
        horizontalSpeed = Math.min(prevHorizSpeed, toTarget.length());
        horizDone = prevHorizSpeed >= toTarget.length();
      } else {
        // 需要转弯：以当前速度和转向速率算转弯圆，
        // 目的地落在圆内说明转不过去 → 停车原地调头。
        const turnCircle = prevHorizSpeed || spinDelta
          ? TargetUtil.computeTurnCircle(
              mapPos as any,
              this.currentMoveDir as any,
              Math.sign(spinDelta) * object.rules.jumpjetTurnRate,
              prevHorizSpeed,
            )
          : undefined;
        if (turnCircle && geometryModule.circleContainsPoint(turnCircle, targetPos)) {
          horizontalSpeed = 0;
          this.currentHorizSpeed = 0;
        } else {
          horizontalSpeed = prevHorizSpeed;
        }
        horizDone = false;
      }
    }
    // 合成本 tick 位移：到达冲刺阶段直接朝目的地，
    // 否则沿当前方向向量走 horizontalSpeed 的距离。
    let moveTarget: Vector2;
    if (reachedTargetDist) {
      horizDone = true;
      moveTarget = toTarget;
    } else {
      moveTarget = this.currentMoveDir.clone().setLength(horizontalSpeed);
    }
    const moveVector = new Vector3(moveTarget.x, climbZ2, moveTarget.y);
    object.moveTrait.velocity.copy(moveVector.clone());
    return { distance: moveVector, done: horizDone && verticalSettled };
  }

  /**
   * 找出从当前位置到目标方向上需要检查障碍的 tile 列表：
   * 沿移动方向投一个 lepton/tile 距离的点，取其所在 tile；
   * 若与当前 tile 不同，把路径可能经过的相邻 tile（含对角）一并返回，
   * 避免斜穿 tile 角落时漏检障碍。
   */
  findTilesToCheckForBlockers(fromTile: any, mapPos: any, moveDir: any, distance: number): any[] {
    const normalized = moveDir
      .clone()
      .setLength(Math.min(distance, Coords.LEPTONS_PER_TILE))
      .add(mapPos)
      .multiplyScalar(1 / Coords.LEPTONS_PER_TILE)
      .floor();
    const destTile = this.game.map.tiles.getByMapCoords(normalized.x, normalized.y);
    if (!destTile || destTile === fromTile) return [fromTile];
    const signX = Math.sign(destTile.rx - fromTile.rx);
    const signY = Math.sign(destTile.ry - fromTile.ry);
    const tiles = [fromTile];
    if (signX) {
      const t = this.game.map.tiles.getByMapCoords(fromTile.rx + signX, fromTile.ry);
      if (t) tiles.push(t);
    }
    if (signY) {
      const t = this.game.map.tiles.getByMapCoords(fromTile.rx, fromTile.ry + signY);
      if (t) tiles.push(t);
    }
    if (signX && signY) {
      const t = this.game.map.tiles.getByMapCoords(fromTile.rx + signX, fromTile.ry + signY);
      if (t) tiles.push(t);
    }
    return tiles;
  }

  /**
   * 计算取消移动时的降落点：目的地所在 tile 的中心（tile 坐标 ×
   * LEPTONS_PER_TILE）加上原目的地在 tile 内的偏移，让单位停在
   * 附近而不是精确的原目的地（取消时不要求精确到位）。
   */
  computeCancelDest(tile: any, targetPos: any): Vector2 {
    const tilePos = targetPos
      .clone()
      .multiplyScalar(1 / Coords.LEPTONS_PER_TILE)
      .floor()
      .multiplyScalar(Coords.LEPTONS_PER_TILE);
    const offset = targetPos.clone().sub(tilePos);
    return new Vector2(tile.rx, tile.ry)
      .multiplyScalar(Coords.LEPTONS_PER_TILE)
      .add(offset);
  }
}
