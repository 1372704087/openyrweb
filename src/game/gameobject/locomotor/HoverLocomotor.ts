/**
 * HoverLocomotor — 悬浮移动器（加速/减速/转向插值/悬浮物理）。
 *
 * 悬浮单位的移动逻辑：不受地形阻碍（ignoresTerrain），按 hoverRules
 * 的加速度/减速度/转向速率驱动。转向时根据角度差动态调整速度，
 * Normal 路径点处检测即将转向时提前减速。
 *
 * 由 game/gameobject/locomotor/HoverLocomotor.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs
 * 打包时优先采用 .ts 模块的编译产物。
 */
import { Coords } from "game/Coords"; // 已转换
import * as FacingUtilModule from "game/gameobject/unit/FacingUtil"; // 已转换
import { GameSpeed } from "game/GameSpeed"; // 已转换
import * as geometryModule from "game/math/geometry"; // 未转换（any-shim）
import { Vector2 } from "game/math/Vector2"; // 已转换
import { Vector3 } from "game/math/Vector3"; // 已转换

/** 悬浮路径点类型。 */
export enum HoverWaypointType {
  None = 0,
  Start = 1,
  Normal = 2,
  End = 3,
  Single = 4,
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export class HoverLocomotor {
  hoverRules: any;
  currentSpeed = 0;
  distanceTravelled = 0;
  carryOverDistance = 0;
  currentWaypointType: HoverWaypointType = HoverWaypointType.None;
  nextWaypointDir = new Vector2();
  initialPosition: any;
  // 以下由 onNewWaypoint 计算。
  maxSpeed = 0;
  acceleration = 0;
  deceleration = 0;
  totalDistanceToTravel = 0;

  constructor(hoverRules: any) {
    this.hoverRules = hoverRules;
    this.currentSpeed = 0;
    this.distanceTravelled = 0;
    this.carryOverDistance = 0;
    this.currentWaypointType = HoverWaypointType.None;
    this.nextWaypointDir = new Vector2();
  }

  /** 选择下一个路径点：更新路径类型与方向向量。 */
  selectNextWaypoint(object: any, waypoints: any[]): any {
    this.currentWaypointType =
      this.currentWaypointType && this.currentWaypointType !== HoverWaypointType.End
        ? HoverWaypointType.Normal
        : HoverWaypointType.Start;
    this.initialPosition = object.position.getMapPosition();
    if (this.currentWaypointType === HoverWaypointType.Start) this.currentSpeed = 0;
    if (waypoints.length <= 1) {
      this.currentWaypointType =
        this.currentWaypointType === HoverWaypointType.Start ? HoverWaypointType.Single : HoverWaypointType.End;
      const last = waypoints[waypoints.length - 1];
      if (last) this.nextWaypointDir.set(last.tile.rx - object.tile.rx, last.tile.ry - object.tile.ry);
    } else {
      const lastWaypoint = waypoints[waypoints.length - 1];
      const prevWaypoint = waypoints[waypoints.length - 2];
      this.nextWaypointDir.set(
        prevWaypoint.tile.rx - lastWaypoint.tile.rx,
        prevWaypoint.tile.ry - lastWaypoint.tile.ry,
      );
    }
    return waypoints[waypoints.length - 1];
  }

  /** 新路径点：计算加速度和减速度（基于 hoverRules 和 baseSpeed）。 */
  onNewWaypoint(object: any, targetPos: any, world: any): void {
    const toTarget = new Vector2().copy(targetPos).sub(this.initialPosition);
    this.distanceTravelled = 0;
    this.totalDistanceToTravel = toTarget.length();
    this.maxSpeed = object.moveTrait.baseSpeed;
    const accelTicks = 60 * this.hoverRules.acceleration * GameSpeed.BASE_TICKS_PER_SECOND;
    this.acceleration = this.maxSpeed / accelTicks;
    const brakeTicks = 60 * this.hoverRules.brake * GameSpeed.BASE_TICKS_PER_SECOND;
    this.deceleration = this.maxSpeed / brakeTicks;
  }

  /**
   * 每 tick 移动物理：
   *  - Single → 恒定半速；
   *  - End → 按减速度刹车（距离不足以停下时保持当前速度）；
   *  - Normal → 加速至 maxSpeed；
   *  - 转向插值：Normal 且方向即将改变时提前调整朝向。
   */
  tick(object: any, targetPos: any, world: any): { distance: Vector3; done: boolean } {
    const pos = object.position.getMapPosition();
    const toTarget = targetPos.clone().sub(pos);
    FacingUtilModule.FacingUtil.pointTurretToTarget(object, world);
    const distToTarget = toTarget.length();
    let maxSpeed = this.maxSpeed;
    if (this.currentWaypointType === HoverWaypointType.Single) {
      this.currentSpeed = maxSpeed / 2;
    } else if (this.currentWaypointType === HoverWaypointType.End) {
      const brakeDistance = this.computeBrakeDistance(this.currentSpeed, this.deceleration);
      if (this.totalDistanceToTravel - this.distanceTravelled <= brakeDistance) {
        this.currentSpeed = Math.max(1, this.currentSpeed - this.deceleration);
      }
    } else {
      this.currentSpeed = Math.min(this.currentSpeed + this.acceleration, maxSpeed);
    }
    const targetFacing = FacingUtilModule.FacingUtil.fromMapCoords(toTarget);
    const waypointFacing = FacingUtilModule.FacingUtil.fromMapCoords(this.nextWaypointDir);
    let desiredFacing = targetFacing;
    let rot = object.rules.rot;
    // Normal 路径点：即将转向时提前调整朝向和减速。
    if (this.currentWaypointType === HoverWaypointType.Normal && targetFacing !== waypointFacing) {
      const angle = geometryModule.angleDegBetweenVec2(this.nextWaypointDir, FacingUtilModule.FacingUtil.toMapCoords(object.direction));
      const ticksNeeded = angle / rot;
      const brakeDist = Math.max(this.currentSpeed * ticksNeeded, this.totalDistanceToTravel);
      if (this.totalDistanceToTravel - this.distanceTravelled <= brakeDist) {
        desiredFacing = waypointFacing;
        rot = angle / ((this.totalDistanceToTravel - this.distanceTravelled) / this.currentSpeed);
      }
    }
    const facingResult = FacingUtilModule.FacingUtil.tick(object.direction, desiredFacing, rot);
    object.direction = facingResult.facing;
    let travelSpeed = this.currentSpeed;
    if (this.carryOverDistance) travelSpeed = this.carryOverDistance;
    const travel = Math.min(travelSpeed, distToTarget);
    const step = toTarget.clone().setLength(travel);
    const velocityWithCarry = step.clone();
    if (this.carryOverDistance) {
      velocityWithCarry.add(Coords.vecWorldToGround(object.moveTrait.velocity));
    }
    object.moveTrait.velocity.set(velocityWithCarry.x, 0, velocityWithCarry.y);
    this.distanceTravelled += travel;
    this.carryOverDistance = Math.max(0, this.currentSpeed - travel);
    return {
      distance: new Vector3(step.x, 0, step.y),
      done: !step.length() || !!this.carryOverDistance,
    };
  }

  /** 刹车距离：v²/(2a) 的离散近似。 */
  computeBrakeDistance(speed: number, deceleration: number): number {
    const ticks = speed / deceleration;
    return Math.max(0, speed * ticks - (deceleration * ticks * ticks) / 2);
  }
}
