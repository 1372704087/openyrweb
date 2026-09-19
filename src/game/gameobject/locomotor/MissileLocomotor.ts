/**
 * MissileLocomotor — 导弹移动器（助推/巡航/末段三阶段制导飞行）。
 *
 * V3 火箭等武器发射后的飞行物理，分三个飞行阶段：
 *  - Boost（助推）：从发射点加速爬升，直到达到巡航高度
 *    （目标点地面高度 + missileRules.altitude）；
 *  - Midcourse（巡航）：水平朝目标转向并逐渐压低弹道；当
 *    水平距离/垂直落差 < 1（抛物线几何上必须进入俯冲）时进入末段；
 *  - Terminal（末段）：全力转向目标向量，剩余直线距离减去弹体长度
 *    不足一步速度时，直接命中（done=true，速度设为"目标-弹体长度"）。
 *
 * lazyCurve=yes 的导弹（懒弹道，如民兵式抛物线导弹）跳过巡航段的
 * 逐步转向，改为在进入末段时用三次贝塞尔曲线（CubicBezierCurve3）
 * 构造一条从当前位置到目标的下降曲线，之后沿曲线飞行。
 *
 * 飞出地图硬边界 → destroyObject 摧毁自身。
 *
 * 注意：tick 无视调用方传入的途经点/目的地参数，目标位置完全由
 * selectNextWaypoint 缓存在 this.targetPosition。
 *
 * 由 game/gameobject/locomotor/MissileLocomotor.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标。
 */
import { Coords } from "game/Coords"; // 已转换
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import * as ObjectLiftOffEventModule from "game/event/ObjectLiftOffEvent"; // 未转换（any-shim）
import * as geometryModule from "game/math/geometry"; // 未转换（any-shim）
import * as FacingUtilModule from "game/gameobject/unit/FacingUtil"; // 已转换
import { Vector3 } from "game/math/Vector3"; // 已转换
import { Vector2 } from "game/math/Vector2"; // 已转换
import * as CubicBezierCurve3Module from "game/math/CubicBezierCurve3"; // 未转换（any-shim）
import { GameMath } from "game/math/GameMath"; // 已转换

/** 导弹飞行阶段（模块私有，与孪生一致不对外导出）。 */
enum MissileFlightPhase {
  /** 助推段：加速爬升到巡航高度。 */
  Boost = 0,
  /** 巡航段：水平转向目标、逐渐压低弹道。 */
  Midcourse = 1,
  /** 末段：俯冲命中。 */
  Terminal = 2,
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export class MissileLocomotor {
  // 字段一律不带初始化器：孪生构造期只有 3 个键（game/missileRules/
  // flightPhase），其余字段都在后续方法里动态创建。
  game: any;
  missileRules: any;
  /** 当前飞行阶段（Boost → Midcourse → Terminal，单向推进）。 */
  flightPhase: MissileFlightPhase;
  /** 目标点世界坐标（selectNextWaypoint 时按最后一个路径点计算）。 */
  targetPosition: any;
  /** 巡航高度 = 目标点地面高度 + missileRules.altitude。 */
  cruiseAltitude: number;
  /** 当前速度向量（首 tick 按朝向/目标方向初始化，之后持续转向目标）。 */
  currentVelocity: any;
  /** lazyCurve 导弹的下降贝塞尔曲线。 */
  descentCurve: any;
  /** lazyCurve 导弹已沿下降曲线飞过的距离。 */
  descentTravelled: number;

  constructor(game: any, missileRules: any) {
    this.game = game;
    this.missileRules = missileRules;
    this.flightPhase = MissileFlightPhase.Boost;
  }

  /**
   * 选择下一个路径点（导弹只取最后一个）：记录目标点世界坐标
   * （tile 中心，含桥面抬升）与巡航高度，返回该路径点。
   */
  selectNextWaypoint(_object: any, waypoints: any[]): any {
    const last = waypoints[waypoints.length - 1];
    const bridge = this.game.map.tileOccupation.getBridgeOnTile(last.tile);
    const groundZ = last.tile.z + (bridge?.tileElevation ?? 0);
    this.targetPosition = Coords.tile3dToWorld(last.tile.rx + 0.5, last.tile.ry + 0.5, groundZ);
    this.cruiseAltitude = Coords.tileHeightToWorld(groundZ) + this.missileRules.altitude;
    return last;
  }

  /** 新路径点回调：导弹不需要（目标位置已在 selectNextWaypoint 缓存）。 */
  onNewWaypoint(_object: any, _currentWaypointLeptons: any, _destinationLeptons: any): void {}

  /**
   * 每 tick 制导飞行，返回 { distance 本 tick 位移, done 是否命中 }。
   * 流程：
   *  1. 速度幅值：已有速度 → 逐步加速到 rules.speed；首 tick →
   *     按朝向（或目标方向）初始化速度向量并上仰 unit 的俯仰角；
   *  2. 按飞行阶段处理方向（见类注释的三阶段说明）；
   *  3. 位置 + 速度若飞出硬边界 → 摧毁自身并结束。
   */
  tick(object: any, _currentWaypointLeptons: any, _destinationLeptons: any): { distance: Vector3; done: boolean } {
    const worldPos = object.position.worldPosition.clone();
    const toTarget = this.targetPosition.clone().sub(worldPos);
    if (object.zone !== ZoneType.Air) {
      object.onBridge = false;
      object.zone = ZoneType.Air;
      this.game.events.dispatch(new ObjectLiftOffEventModule.ObjectLiftOffEvent(object));
    }
    // 本 tick 的速度幅值（leptons/tick）。
    let speed: number;
    if (this.currentVelocity) {
      // 已有速度：逐步加速，上限 rules.speed。
      speed = Math.min(this.currentVelocity.length() + this.missileRules.acceleration, object.rules.speed);
    } else {
      // 首 tick 初始化速度方向：
      //  - lazyCurve → 直接水平指向目标；
      //  - 普通 → 沿弹体当前朝向；
      // 然后按俯仰角把速度向量绕横轴上仰（贴着 unit.pitch 的姿态）。
      this.currentVelocity = this.missileRules.lazyCurve
        ? new Vector3(toTarget.x, 0, toTarget.z)
        : Coords.vecGroundToWorld(FacingUtilModule.FacingUtil.toMapCoords(object.direction));
      geometryModule.rotateVec3Towards(
        this.currentVelocity,
        new Vector3(this.currentVelocity.x, 1e8, this.currentVelocity.z),
        object.pitch,
      );
      speed = this.missileRules.acceleration;
    }
    this.currentVelocity.setLength(speed);
    let done = false;
    switch (this.flightPhase) {
      case MissileFlightPhase.Boost:
        // 未到巡航高度：本 tick 继续爬升（done 保持 false）。
        if (!(object.position.worldPosition.y >= this.cruiseAltitude)) {
          done = false;
          break;
        }
        // 到达巡航高度 → 推进到巡航段，并贯穿执行本 tick 的巡航逻辑。
        this.flightPhase = MissileFlightPhase.Midcourse;
      /* 故意贯穿（fallthrough）：新阶段立即生效。 */
      case MissileFlightPhase.Midcourse: {
        // 到目标的水平距离。
        const horizDist = new Vector2(toTarget.x, toTarget.z).length();
        if (!this.missileRules.lazyCurve) {
          // 普通导弹：先水平压平（绕规则转速转向水平方向），
          // 保留至少 1 的垂直分量维持上仰姿态。
          geometryModule.rotateVec3Towards(
            this.currentVelocity,
            new Vector3(this.currentVelocity.x, 0, this.currentVelocity.z),
            object.rules.rot,
          );
          if (this.currentVelocity.y < 1) {
            const len = this.currentVelocity.length();
            this.currentVelocity.y = 0;
            this.currentVelocity.setLength(len);
          }
          // 再朝"目标水平方向 + 当前垂直分量"转向（逐渐压低弹道）。
          geometryModule.rotateVec3Towards(
            this.currentVelocity,
            new Vector3(toTarget.x, this.currentVelocity.y, toTarget.z),
            object.rules.rot,
          );
          // 弹体朝向/俯仰角跟随速度向量。
          object.direction = FacingUtilModule.FacingUtil.fromMapCoords(Coords.vecWorldToGround(this.currentVelocity));
          object.pitch =
            Math.sign(this.currentVelocity.y) *
            geometryModule.angleDegBetweenVec3(
              this.currentVelocity,
              new Vector3(this.currentVelocity.x, 0, this.currentVelocity.z),
            );
          // 水平距离/垂直落差 < 1 → 几何上必须俯冲了，进入末段。
          if (horizDist / (worldPos.y - this.targetPosition.y) < 1) {
            this.flightPhase = MissileFlightPhase.Terminal;
          }
          break;
        }
        // lazyCurve 导弹跳过逐步转向：直接构造下降贝塞尔曲线进末段。
        // 控制点 1：沿当前速度方向、长度 = 水平距离/3/cos(俯仰角)；
        // 控制点 2：目标点向回 lerp 15%，高度与控制点 1 一致（平滑入射角）。
        this.flightPhase = MissileFlightPhase.Terminal;
        const control1 = worldPos.clone().add(
          this.currentVelocity.clone().setLength(horizDist / 3 / GameMath.cos(geometryModule.degToRad(object.pitch))),
        );
        const control2 = this.targetPosition.clone().lerp(worldPos, 0.15).setY(control1.y);
        this.descentCurve = new CubicBezierCurve3Module.CubicBezierCurve3(worldPos, control1, control2, this.targetPosition);
      }
      /* 故意贯穿（fallthrough）：lazyCurve 构造完曲线后立即飞末段。 */
      case MissileFlightPhase.Terminal: {
        const bodyLength = this.missileRules.bodyLength;
        if (this.missileRules.lazyCurve) {
          // 沿下降曲线推进：本 tick 最多走 speed，且不超过"曲线长-弹体长"。
          const curveLength = this.descentCurve.getLength();
          this.descentTravelled = this.descentTravelled ?? 0;
          this.descentTravelled += Math.min(speed, curveLength - bodyLength - this.descentTravelled);
          const t = this.descentTravelled / curveLength;
          const point = this.descentCurve.getPointAt(t);
          const tangent = this.descentCurve.getTangentAt(t);
          // 速度向量 = 曲线上的点 - 当前位置（指向曲线前方的位移）。
          this.currentVelocity.copy(point.sub(worldPos));
          // 俯仰角 = 完整切线与水平切线的夹角。
          const flatTangent = tangent.clone().setY(0);
          object.pitch = Math.sign(tangent.y - flatTangent.y) * geometryModule.angleDegBetweenVec3(flatTangent, tangent);
          // 弹体尾部（剩余曲线 ≤ 弹体长度）视为命中。
          done = 1 <= (this.descentTravelled + bodyLength) / curveLength;
        } else {
          // 普通导弹：全力转向目标向量，朝向/俯仰角跟随。
          geometryModule.rotateVec3Towards(this.currentVelocity, toTarget, object.rules.rot);
          object.direction = FacingUtilModule.FacingUtil.fromMapCoords(Coords.vecWorldToGround(this.currentVelocity));
          object.pitch =
            Math.sign(this.currentVelocity.y) *
            geometryModule.angleDegBetweenVec3(
              this.currentVelocity,
              new Vector3(this.currentVelocity.x, 0, this.currentVelocity.z),
            );
          // 剩余直线距离（扣除弹体长度）不足一步速度（或 <1）→ 命中：
          // 速度改为"目标-弹体长度"的固定位移。
          const remaining = toTarget.length() - bodyLength;
          if (remaining < speed || remaining < 1) {
            this.currentVelocity.copy(toTarget.clone().addScalar(-bodyLength));
            done = true;
          }
        }
        break;
      }
      default:
        throw new Error(`Unhandled flight phase "${this.flightPhase}"`);
    }
    // 下一位置飞出硬边界 → 摧毁导弹；否则应用速度继续飞。
    const nextPos = worldPos.clone().add(this.currentVelocity);
    if (this.game.map.isWithinHardBounds(nextPos)) {
      object.moveTrait.velocity.copy(this.currentVelocity);
      return { distance: this.currentVelocity, done };
    }
    this.game.destroyObject(object);
    return { done: true, distance: new Vector3() };
  }
}
