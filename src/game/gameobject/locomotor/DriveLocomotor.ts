/**
 * DriveLocomotor — 履带/轮式载具移动器（加速度/转弯曲线/地形速度）。
 *
 * 核心移动逻辑：
 *  - selectNextWaypoint：选择下一个路径点；满足转弯条件时构建
 *    CurvePath（LineCurve + QuadraticBezierCurve + LineCurve）实现
 *    平滑转弯（moveOnCurve=true）；
 *  - tick：按加速度模型推进（accelerates=yes 时渐进加速/减速），
 *    地形通行速度修正，carryOverDistance 处理跨 tick 剩余移动量；
 *  - applyAcceleration：起步半速、匀速、终点减速的三阶段模型。
 *
 * WaypointType 枚举标记路径点在路径中的位置（起点/中间/终点/单点），
 * 决定加速和转向行为。
 *
 * 由 game/gameobject/locomotor/DriveLocomotor.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标。
 */
import * as FacingUtilModule from "game/gameobject/unit/FacingUtil"; // 已转换
import * as TurnTaskModule from "game/gameobject/task/TurnTask"; // 未转换（any-shim）
import { Coords } from "game/Coords"; // 已转换
import * as geometryModule from "game/math/geometry"; // 未转换（any-shim）
import { Vector2 } from "game/math/Vector2"; // 已转换
import { Vector3 } from "game/math/Vector3"; // 已转换
import * as CurvePathModule from "game/math/CurvePath"; // 未转换（any-shim）
import * as LineCurveModule from "game/math/LineCurve"; // 未转换（any-shim）
import * as QuadraticBezierCurveModule from "game/math/QuadraticBezierCurve"; // 未转换（any-shim）
import { lerp } from "util/math"; // 已转换

/** 路径点在路径中的位置。 */
export enum WaypointType {
  None = 0,
  /** 路径起点（第一次选点）。 */
  Start = 1,
  /** 路径中间点。 */
  Normal = 2,
  /** 路径终点。 */
  End = 3,
  /** 单点路径（起点即终点）。 */
  Single = 4,
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export class DriveLocomotor {
  game: any;
  hasMomentum = false;
  moveOnCurve = false;
  currentSpeed = 0;
  distanceTravelled = 0;
  carryOverDistance = 0;
  currentWaypointType: WaypointType = WaypointType.None;
  initialPosition: any;
  steerCurve: any;
  lastPosition: any;
  totalDistanceToTravel: number;

  constructor(game: any) {
    this.game = game;
    this.hasMomentum = false;
    this.moveOnCurve = false;
    this.currentSpeed = 0;
    this.distanceTravelled = 0;
    this.carryOverDistance = 0;
    this.currentWaypointType = WaypointType.None;
  }

  /**
   * 选择下一个路径点：
   *  - 首次选点 → Start；
   *  - 已有动量且转角 <90° → 构建平滑转弯曲线（moveOnCurve）；
   *  - 否则直接返回最后一个路径点（直线移动）。
   */
  selectNextWaypoint(object: any, waypoints: any[]): any {
    this.currentWaypointType =
      this.currentWaypointType && this.currentWaypointType !== WaypointType.End
        ? WaypointType.Normal
        : WaypointType.Start;
    this.initialPosition = object.position.getMapPosition();
    if (this.currentWaypointType !== WaypointType.Start) {
      object.moveTrait.speedPenalty = 0;
    } else {
      this.currentSpeed = 0;
    }
    if (waypoints.length > 1) {
      const lastWaypoint = waypoints[waypoints.length - 1];
      const prevWaypoint = waypoints[waypoints.length - 2];
      const toLast = new Vector2(lastWaypoint.tile.rx - object.tile.rx, lastWaypoint.tile.ry - object.tile.ry);
      const angleDiff = Math.abs(
        geometryModule.angleDegFromVec2(toLast) -
          geometryModule.angleDegFromVec2(new Vector2(prevWaypoint.tile.rx - lastWaypoint.tile.rx, prevWaypoint.tile.ry - lastWaypoint.tile.ry)),
      );
      if (
        !Math.abs(FacingUtilModule.FacingUtil.fromMapCoords(toLast) - object.direction) &&
        angleDiff > 0 &&
        angleDiff < 90 &&
        this.hasMomentum
      ) {
        // 满足转弯条件：构建平滑曲线路径。
        this.moveOnCurve = true;
        this.currentWaypointType =
          waypoints.length === 2
            ? this.currentWaypointType === WaypointType.Start
              ? WaypointType.Single
              : WaypointType.End
            : WaypointType.Normal;
        const startPos = this.initialPosition;
        const lastCenter = new Vector2(
          lastWaypoint.tile.rx + 0.5,
          lastWaypoint.tile.ry + 0.5,
        ).multiplyScalar(Coords.LEPTONS_PER_TILE);
        const prevCenter = new Vector2(
          prevWaypoint.tile.rx + 0.5,
          prevWaypoint.tile.ry + 0.5,
        ).multiplyScalar(Coords.LEPTONS_PER_TILE);
        let midPoint = startPos.clone().lerp(lastCenter, 0.5);
        const endTangent = lastCenter.clone().lerp(prevCenter, 0.5);
        this.steerCurve = new CurvePathModule.CurvePath();
        this.steerCurve.add(new LineCurveModule.LineCurve(startPos, midPoint));
        this.steerCurve.add(new QuadraticBezierCurveModule.QuadraticBezierCurve(midPoint, lastCenter, endTangent));
        this.steerCurve.add(new LineCurveModule.LineCurve(endTangent, prevCenter));
        this.lastPosition = startPos;
        return prevCenter;
      }
    } else {
      this.currentWaypointType =
        this.currentWaypointType === WaypointType.Start ? WaypointType.Single : WaypointType.End;
    }
    this.hasMomentum = true;
    this.moveOnCurve = false;
    return waypoints[waypoints.length - 1];
  }

  /** 新路径点：更新朝向（非曲线时需先转向）。 */
  onNewWaypoint(object: any, targetPos: any, world: any): any[] | void {
    const toTarget = new Vector2().copy(targetPos).sub(this.initialPosition);
    this.distanceTravelled = 0;
    this.totalDistanceToTravel = this.moveOnCurve ? this.steerCurve.getLength() : toTarget.length();
    const facing = FacingUtilModule.FacingUtil.fromMapCoords(toTarget);
    if (facing !== object.direction) {
      this.pointTurretToTarget(object, world);
      if (!this.moveOnCurve) {
        object.moveTrait.velocity.set(0, 0, 0);
        return [new TurnTaskModule.TurnTask(facing)];
      }
    }
  }

  /**
   * 每 tick 移动物理：
   *  - 加速度模型（accelerates=yes）或恒定 baseSpeed；
   *  - 地形通行速度乘数；
   *  - 曲线移动沿 steerCurve 取点 / 直线移动按方向推进；
   *  - carryOverDistance 处理跨 tick 剩余移动量。
   */
  tick(object: any, targetPos: any, lastTarget: any): { distance: Vector3; done: boolean } {
    this.pointTurretToTarget(object, lastTarget);
    let speed = this.currentSpeed;
    if (object.rules.accelerates) {
      const progress = this.distanceTravelled / this.totalDistanceToTravel;
      this.currentSpeed = this.applyAcceleration(object, speed, object.moveTrait.baseSpeed, progress);
      speed = this.currentSpeed;
    } else {
      this.currentSpeed = object.moveTrait.baseSpeed;
      speed = this.currentSpeed;
    }
    if (speed > 1) speed = Math.floor(speed);
    // 地形通行速度乘数。
    let terrainSpeed = this.game.map.terrain.getPassableSpeed(
      object.tile,
      object.rules.speedType,
      object.isInfantry(),
      object.onBridge,
      undefined,
      true,
    );
    if (terrainSpeed) {
      object.moveTrait.lastTileSpeed = terrainSpeed;
    } else {
      terrainSpeed = object.moveTrait.lastTileSpeed || 1;
    }
    speed *= terrainSpeed;
    if (speed > 1) speed = Math.floor(speed);
    if (this.carryOverDistance) speed = this.carryOverDistance;
    const mapPosition = object.position.getMapPosition();
    let moveVector: Vector2;
    if (this.moveOnCurve) {
      // 曲线移动：沿 steerCurve 推进。
      const curveLength = this.steerCurve.getLength();
      const newTravelled = Math.min(this.distanceTravelled + speed, curveLength);
      this.carryOverDistance = Math.max(0, this.distanceTravelled + speed - curveLength);
      this.distanceTravelled = newTravelled;
      const point = this.steerCurve.getPointAt(this.distanceTravelled / curveLength);
      const tangent = this.steerCurve.getTangentAt(this.distanceTravelled / curveLength);
      const step = tangent.clone().setLength(speed);
      object.moveTrait.velocity.set(step.x, 0, step.y);
      const rot = object.rules.rot;
      const facingResult = FacingUtilModule.FacingUtil.tick(
        object.direction,
        FacingUtilModule.FacingUtil.fromMapCoords(tangent),
        rot,
      );
      object.direction = facingResult.facing;
      object.spinVelocity = facingResult.delta;
      const prevPosition = this.lastPosition;
      this.lastPosition = point.clone();
      moveVector = point.clone().sub(prevPosition);
    } else {
      // 直线移动：朝目标推进。
      const toTarget = new Vector2().copy(targetPos).sub(mapPosition);
      const travelDist = Math.min(toTarget.length(), speed);
      moveVector = toTarget.clone().setLength(travelDist);
      const velocityWithCarry = moveVector.clone();
      if (this.carryOverDistance) {
        velocityWithCarry.add(Coords.vecWorldToGround(object.moveTrait.velocity));
      }
      object.moveTrait.velocity.set(velocityWithCarry.x, 0, velocityWithCarry.y);
      this.distanceTravelled += travelDist;
      this.carryOverDistance = Math.max(0, speed - toTarget.length());
    }
    return {
      distance: new Vector3(moveVector.x, 0, moveVector.y),
      done: !moveVector.length() || !!this.carryOverDistance,
    };
  }

  pointTurretToTarget(object: any, world: any): void {
    FacingUtilModule.FacingUtil.pointTurretToTarget(object, world);
  }

  /**
   * 加速度模型：
   *  - Single（单点路径）→ 半速；
   *  - 非 End → 渐进加速（current + accelerationFactor × base，上限 base）；
   *  - End → 减速（后半程线性减速至 0）。
   */
  applyAcceleration(object: any, currentSpeed: number, baseSpeed: number, progress: number): number {
    if (this.currentWaypointType === WaypointType.Single) return baseSpeed / 2;
    if (this.currentWaypointType !== WaypointType.End) {
      return Math.min(currentSpeed + object.rules.accelerationFactor * baseSpeed, baseSpeed);
    }
    // 终点减速：曲线移动时 progress 从 [0.5,1] 重映射到 [0,1]（前半程不减）；
    // 非曲线移动直接用原始 progress。
    if (this.moveOnCurve) {
      progress = progress <= 0.5 ? 0 : 2 * (progress - 0.5);
    }
    return lerp(1, baseSpeed, 1 - progress);
  }
}
