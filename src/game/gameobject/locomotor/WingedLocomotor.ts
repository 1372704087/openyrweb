/**
 * WingedLocomotor — 固定翼飞机移动器（直飞/盘旋/悬停扫射三种机动 + 机场起降）。
 *
 * 固定翼（战斗机/轰炸机等）的飞行物理，核心是机动类型状态机：
 *  - None（直线）：朝目的地直飞，朝向对准且距离 ≤ 1 tile 时切换；
 *  - CircleStrafe（盘旋）：空中低速（<5 lepton/tick）且目标较远时进入，
 *    推进方向保持与机身朝向差 90°，绕目标兜圈子（不减速不掉头）；
 *  - HoverStrafe（悬停扫射）：近距离/被取消/对准时进入，机身指向
 *    攻击目标（或待命朝向 270°/机位朝向 0°），推进方向仍朝目的地。
 *
 * 三种姿态动画（原版 YR 行为的 OpenYRWeb 补全）：
 *  - 压坡转弯：转弯剩余角越大压坡越深（上限 ≈29.75°，dbl_B44310），
 *    固定速率进出坡度，不瞬间贴地；
 *  - 机翼摆动：飞行中叠加 sin(frame%20 × 0.314) × 1.5 的轻微滚转振荡；
 *  - 不俯冲：全程保持巡航高度（地形跟随 ±30/tick 修正），机头俯仰
 *    随垂直速度平滑过渡（PitchAngle=0 的单位如 MiG 保持水平）。
 *
 * 降落由 static tickStationary 处理：陆基单位检查地形可降，机场单位
 * （airportBoundTrait）寻找机场/预订机位并排队 MoveToDockTask，舰载机
 * （spawnLinkTrait）必须落回母舰所在 tile。
 *
 * tick 调用契约同 JumpjetLocomotor：tick(object, currentWaypointLeptons,
 * destinationLeptons, isCancelled)，途经点参数被忽略（直飞目的地）。
 *
 * 由 game/gameobject/locomotor/WingedLocomotor.ts.js 重写为 TS（行为
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
import * as MoveToDockTaskModule from "game/gameobject/task/MoveToDockTask"; // 未转换（any-shim）
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import { Vector2 } from "game/math/Vector2"; // 已转换
import { Vector3 } from "game/math/Vector3"; // 已转换
import { lerp } from "util/math"; // 已转换
import { GameMath } from "game/math/GameMath"; // 已转换

/** 飞行机动类型（模块私有，与孪生一致不对外导出）。 */
enum WingedManeuverType {
  /** 直线飞行。 */
  None = 0,
  /** 盘旋：绕目标兜圈子（空中低速 + 远距离）。 */
  CircleStrafe = 1,
  /** 悬停扫射：近距离对准目标悬停攻击。 */
  HoverStrafe = 2,
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export class WingedLocomotor {
  // 字段一律不带初始化器：孪生构造期只有 7 个键，其余（cancelDestLeptons/
  // thrustFacing）在后续方法里动态创建。
  game: any;
  allowOutOfBounds: boolean;
  /** 上一次的目的地（检测目的地变化 → 重新决策机动类型）。 */
  lastDestLeptons: Vector2;
  /** 当前推进方向对应的地图平面方向向量。 */
  currentMoveDir: Vector2;
  /** 当前水平速度（leptons/tick），每 tick ±2 渐进调整。 */
  currentHorizSpeed: number;
  /** 当前机动类型（None/CircleStrafe/HoverStrafe）。 */
  maneuverType: WingedManeuverType;
  /** 是否正在为调头减速（下一 tick 继续减速而非加速）。 */
  deceleratingToTurn: boolean;
  /** 取消移动时的临时降落点缓存（同 JumpjetLocomotor）。 */
  cancelDestLeptons: any;
  /** 推进方向（可与机身朝向不同：盘旋时差 90°），首 tick 初始化。 */
  thrustFacing: number;

  constructor(game: any) {
    this.game = game;
    this.allowOutOfBounds = true;
    this.lastDestLeptons = new Vector2();
    this.currentMoveDir = new Vector2();
    this.currentHorizSpeed = 0;
    this.maneuverType = WingedManeuverType.None;
    this.deceleratingToTurn = false;
  }

  /**
   * 静止待命：判断能否降落并处理降落/待命姿态。
   *  - 陆基单位：非水域 + 地面可通行 + 无障碍 → 可降；
   *  - 机场单位（airportBoundTrait）：跳过地形检查，由机场逻辑接管——
   *    没停进机位时找机场/预订机位/排队 MoveToDockTask，无处可降则坠毁；
   *  - 舰载机（spawnLinkTrait）：必须与母舰同 tile 才可降，落到母舰甲板。
   * 可降未落地时先调整待命朝向（机位内 0° / 待命 270°），每 tick 转一步；
   * 高度上向目标靠拢（≤30/tick），到位且可降 → 落地（Zone=Ground、
   * 舰载机存入母舰、派发 ObjectLandEvent、拾取脚下箱子）。
   */
  static tickStationary(object: any, world: any): void {
    if (object.zone !== ZoneType.Air) return;
    const bridge = object.tile.onBridgeLandType
      ? world.map.tileOccupation.getBridgeOnTile(object.tile)
      : undefined;
    let canLand = object.rules.landable && !object.unitOrderTrait.getCurrentTask()?.preventLanding;
    const parent = object.spawnLinkTrait?.getParent();
    if (canLand && parent) {
      // 舰载机：母舰不在桥上时该 tile 不能有桥，且必须与母舰同 tile。
      canLand = !(((!parent.isUnit() || !parent.onBridge) && bridge) || parent.tile !== object.tile);
    } else if (canLand && !object.airportBoundTrait) {
      // 非机场单位：地形检查（非水域/通行速度 >0/无障碍）。
      canLand =
        world.map.getTileZone(object.tile) !== ZoneType.Water &&
        world.map.terrain.getPassableSpeed(object.tile, SpeedType.Foot, true, !!object.tile.onBridgeLandType) > 0 &&
        world.map.terrain.findObstacles({ tile: object.tile, onBridge: bridge }, object).length === 0;
    }
    let targetY: number;
    if (canLand) {
      const dockTrait = object.airportBoundTrait?.preferredAirport?.dockTrait;
      const docked = dockTrait?.isDocked(object) || dockTrait?.hasReservedDockForUnit(object);
      if (!object.airportBoundTrait || docked) {
        // 已停进机位 → 机头朝 0；无需机场 → 待命朝向 270（进场方向）。
        const targetFacing = docked ? 0 : 270;
        if (object.direction !== targetFacing) {
          object.direction = FacingUtilModule.FacingUtil.tick(object.direction, targetFacing, object.rules.rot).facing;
          return;
        }
      }
      if (object.airportBoundTrait) {
        let airport = object.airportBoundTrait.preferredAirport;
        if (!airport?.dockTrait?.isDocked(object)) {
          // 还没停进机位：优先机场有空位就保留；没空位重新找机场并预订机位。
          if (!airport?.dockTrait?.getAvailableDockCount()) {
            airport = object.airportBoundTrait.findAvailableAirport(object);
            object.airportBoundTrait.preferredAirport = airport;
            if (airport) {
              const dockNumber = airport.dockTrait.getFirstAvailableDockNumber();
              airport.dockTrait.reserveDockAt(object, dockNumber);
            }
          }
          if (airport) {
            // 排队进港任务并立刻 tick 一次（本帧就处理）。
            // 去重：任务链里已有 MoveToDock 时不再叠挂，避免 Idle 每 tick 重复 addTask。
            const alreadyQueued = (() => {
              try {
                const tasks = object.unitOrderTrait?.getTasks?.() || [];
                return tasks.some((t: any) => {
                  if (!t) return false;
                  if (t instanceof MoveToDockTaskModule.MoveToDockTask) return true;
                  // harness 桩实例：$stub 记录规范名
                  if (t.$stub === "game/gameobject/task/MoveToDockTask") return true;
                  return t.constructor?.name === "MoveToDockTask";
                });
              } catch {
                return false;
              }
            })();
            if (!alreadyQueued) {
              object.unitOrderTrait.addTask(new MoveToDockTaskModule.MoveToDockTask(world, airport));
            }
            object.unitOrderTrait[NotifyTickModule.NotifyTick.onTick](object, world);
          } else {
            // 无处可降 → 坠毁。
            object.crashableTrait.crash(undefined);
          }
          return;
        }
      }
      // 降落目标高度：舰载机停母舰甲板，其余停地面（含桥面抬升）。
      const groundZ = parent ? parent.tile.z + parent.tileElevation : object.tile.z + (bridge?.tileElevation ?? 0);
      targetY = Coords.tileHeightToWorld(groundZ);
    } else {
      // 不可降：爬回巡航高度（rules.flightLevel 优先，缺省用全局设置）。
      const groundZ = object.tile.z + (bridge?.tileElevation ?? 0);
      const flightLevel = object.rules.flightLevel ?? world.rules.general.flightLevel;
      targetY = Coords.tileHeightToWorld(groundZ) + flightLevel;
    }
    const currentY = object.position.worldPosition.y;
    // 静止姿态：机头随垂直速度俯仰（≤PitchAngle），机翼以 ±4/tick 回平。
    const vert = targetY !== currentY ? Math.sign(targetY - currentY) * Math.min(30, Math.abs(targetY - currentY)) : 0;
    const pitchTarget = object.rules.pitchAngle ? (vert / 30) * object.rules.pitchAngle : 0;
    const pitchRate = Math.max(1, (object.rules.pitchSpeed || 0.25) * 8);
    object.pitch += Math.max(-pitchRate, Math.min(pitchRate, pitchTarget - object.pitch));
    object.roll += Math.max(-4, Math.min(4, -object.roll));
    if (targetY !== currentY) {
      // 垂直移动 ≤30/tick 向目标高度靠拢。
      const prevElevation = object.tileElevation;
      object.position.moveByLeptons3(new Vector3(0, vert, 0));
      object.moveTrait.handleElevationChange(prevElevation, world);
    } else if (canLand) {
      // 高度已到位且可降 → 正式落地。
      object.zone = ZoneType.Ground;
      if (parent) parent.airSpawnTrait.storeAircraft(object, world);
      else object.onBridge = !!bridge;
      world.events.dispatch(new ObjectLandEventModule.ObjectLandEvent(object));
      // 落地点如果有箱子，直接拾取。
      const crate = world.map.tileOccupation
        .getGroundObjectsOnTile(object.tile)
        .find((obj: any) => obj.isOverlay() && obj.rules.crate);
      if (crate) world.crateGeneratorTrait.pickupCrate(object, crate, world);
    }
  }

  /**
   * 坠毁物理（被击落时每 tick 调用）：保持水平方向的速度分量继续前飞、
   * 固定 30/tick 的高度损失；机身以随机的滚转/俯仰增量打转
   * （crashState 缓存随机值保证每 tick 一致）。
   */
  static tickCrash(object: any, world: any, crashState: any): Vector3 {
    crashState.rollDelta = crashState.rollDelta ?? world.generateRandomInt(-15, 15);
    crashState.pitchDelta = crashState.pitchDelta ?? world.generateRandomInt(0, 15);
    object.roll += crashState.rollDelta;
    object.pitch += crashState.pitchDelta;
    const groundVel = Coords.vecWorldToGround(object.moveTrait.velocity);
    return new Vector3(groundVel.x, -30, groundVel.y);
  }

  /**
   * 新途经点回调：把当前速度的水平分量继承为水平速度（飞机不刹停，
   * 换目标时保留动量），并清空取消降落点缓存。
   */
  onNewWaypoint(object: any, _currentWaypointLeptons: any, _destinationLeptons: any): void {
    this.currentHorizSpeed = Coords.vecWorldToGround(object.moveTrait.velocity).length();
    this.cancelDestLeptons = undefined;
  }

  /**
   * 每 tick 飞行物理，返回 { distance 本 tick 位移, done 是否到达 }。
   * 流程：
   *  1. 取消中 → 飞取消落点；目的地变化 → 重新决策机动类型；
   *  2. 首次进入空中 → 派发 ObjectLiftOffEvent；
   *  3. 按机动类型确定机身目标朝向（悬停指向攻击目标/待命朝向），
   *     FacingUtil.tick 转向并记录转角增量；
   *  4. 姿态：压坡转弯 + 机翼摆动 + 机头俯仰随垂直速度；
   *  5. 推进朝向独立缓动（低速时立即对齐），对齐前若目的地落在
   *     转弯圆内 → 减速调头（deceleratingToTurn）；
   *  6. 距离 <1 lepton 或 速度 ≥ 距离 → 到达。
   */
  tick(
    object: any,
    _currentWaypointLeptons: any,
    targetPos: any,
    isCancelled: any,
  ): { distance: Vector3; done: boolean } {
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
    const distance = toTarget.length();
    // 目的地变化 → 重新决策机动类型（取消 → 悬停；空中低速 → 远则盘旋近则悬停）。
    if (!this.lastDestLeptons.equals(targetPos)) {
      this.lastDestLeptons.copy(targetPos);
      if (isCancelled) {
        this.maneuverType = WingedManeuverType.HoverStrafe;
      } else if (object.zone === ZoneType.Air && this.currentHorizSpeed < 5) {
        this.maneuverType =
          distance > Coords.LEPTONS_PER_TILE ? WingedManeuverType.CircleStrafe : WingedManeuverType.HoverStrafe;
      } else {
        this.maneuverType = WingedManeuverType.None;
      }
      this.deceleratingToTurn = false;
    }
    if (object.zone !== ZoneType.Air) {
      object.onBridge = false;
      object.zone = ZoneType.Air;
      this.game.events.dispatch(new ObjectLiftOffEventModule.ObjectLiftOffEvent(object));
    }
    const bridge = object.tile.onBridgeLandType ? this.game.map.tileOccupation.getBridgeOnTile(object.tile) : undefined;
    const groundZ = object.tile.z + (bridge?.tileElevation ?? 0);
    const cruiseAltitude = Coords.tileHeightToWorld(groundZ) +
      (object.rules.flightLevel ?? this.game.rules.general.flightLevel);
    const currentY = object.position.worldPosition.y;
    const desiredFacing = FacingUtilModule.FacingUtil.fromMapCoords(toTarget);
    // 已对准目的地：距离 ≤1 tile → 悬停扫射；盘旋中 → 恢复直线。
    if (
      object.direction === desiredFacing && this.maneuverType === WingedManeuverType.None &&
      distance <= Coords.LEPTONS_PER_TILE
    ) {
      this.maneuverType = WingedManeuverType.HoverStrafe;
    } else if (object.direction === desiredFacing && this.maneuverType === WingedManeuverType.CircleStrafe) {
      this.maneuverType = WingedManeuverType.None;
    }
    // 机身目标朝向：悬停 → 指向攻击目标（无目标则待命朝向）；其余 → 指向目的地。
    let bodyFacing: number;
    switch (this.maneuverType) {
      case WingedManeuverType.HoverStrafe:
        if (object.attackTrait?.currentTarget) {
          const targetGround = Coords.vecWorldToGround(object.attackTrait.currentTarget.getWorldCoords());
          bodyFacing = FacingUtilModule.FacingUtil.fromMapCoords(targetGround.sub(mapPos));
        } else {
          bodyFacing = object.airportBoundTrait?.preferredAirport?.dockTrait?.hasReservedDockForUnit(object) ? 0 : 270;
        }
        break;
      case WingedManeuverType.CircleStrafe:
      case WingedManeuverType.None:
        bodyFacing = desiredFacing;
        break;
      default:
        throw new Error('Unknown maneuver type "' + this.maneuverType);
    }
    const bodyResult = FacingUtilModule.FacingUtil.tick(object.direction, bodyFacing, object.rules.rot);
    object.direction = bodyResult.facing;
    const turnDelta = bodyResult.delta;
    // 压坡转弯（OpenYRWeb：原版 YR 行为）：目标坡度由剩余转角决定
    // （大转弯深坡、小转弯浅坡），上限 dbl_B44310 ≈ 29.75°，±4/tick 进出坡。
    const targetRoll =
      Math.sign(turnDelta) * Math.max(10, Math.min((((bodyFacing - bodyResult.facing + 540) % 360) - 180) * 0.5, 29.75));
    object.roll += Math.max(-4, Math.min(4, targetRoll - object.roll));
    // 机翼摆动（OpenYRWeb：原版 sub_4CF830）：飞行中叠加轻微滚转振荡，
    // 让机翼在平飞时也略有摇晃。
    if (this.currentHorizSpeed > 0) {
      object.roll += Math.sin((this.game.currentTick % 20) * 0.3141592653589793) * 1.5;
    }
    // 推进方向目标：悬停 → 朝目的地；盘旋 → 与机身朝向差 90°；直线 → 与机身一致。
    let thrustTarget: number;
    switch (this.maneuverType) {
      case WingedManeuverType.HoverStrafe:
        thrustTarget = desiredFacing;
        break;
      case WingedManeuverType.CircleStrafe:
        thrustTarget = (bodyResult.facing - 90 * Math.sign(turnDelta) + 360) % 360;
        break;
      case WingedManeuverType.None:
        thrustTarget = bodyResult.facing;
        break;
      default:
        throw new Error('Unknown maneuver type "' + this.maneuverType);
    }
    if (this.thrustFacing === undefined) this.thrustFacing = thrustTarget;
    // 推进朝向缓动：低速（≤5）时转速 ∞（立即对齐），高速按 rules.rot。
    const thrustTurnRate = 5 < this.currentHorizSpeed ? object.rules.rot : Number.POSITIVE_INFINITY;
    const thrustResult = FacingUtilModule.FacingUtil.tick(this.thrustFacing, thrustTarget, thrustTurnRate);
    this.thrustFacing = thrustResult.facing;
    const thrustDelta = thrustResult.delta;
    this.currentMoveDir.copy(FacingUtilModule.FacingUtil.toMapCoords(this.thrustFacing));
    // horizDone：水平到位；climbZ：本 tick 垂直位移；verticalSettled：高度已稳定。
    let horizDone = false;
    let climbZ = 0;
    let horizontalSpeed = 0;
    let verticalSettled = true;
    // 巡航高度跟随（OpenYRWeb：全程不俯冲，只做 ±30/tick 的垂直修正）。
    if (cruiseAltitude !== currentY) {
      const heightDiff = Math.abs(cruiseAltitude - currentY);
      climbZ = Math.sign(cruiseAltitude - currentY) * Math.min(30, heightDiff);
      verticalSettled = heightDiff <= 30;
    }
    // 机头俯仰随垂直速度（OpenYRWeb：原版行为）——爬升抬头、俯冲低头，
    // 上限 PitchAngle，由 PitchSpeed 平滑；PitchAngle=0（如 MiG）保持水平。
    const targetPitch = object.rules.pitchAngle ? (climbZ / 30) * object.rules.pitchAngle : 0;
    const pitchRate = Math.max(1, (object.rules.pitchSpeed || 0.25) * 8);
    object.pitch += Math.max(-pitchRate, Math.min(pitchRate, targetPitch - object.pitch));
    // 本 tick 目标速度：接近目的地（非盘旋）时按距离比例降速到一半。
    let targetSpeed = object.rules.speed;
    if (distance <= Coords.LEPTONS_PER_TILE && this.maneuverType !== WingedManeuverType.CircleStrafe) {
      targetSpeed = lerp(1, targetSpeed / 2, GameMath.sqrt(distance / Coords.LEPTONS_PER_TILE));
    }
    if (this.deceleratingToTurn) {
      this.currentHorizSpeed = Math.max(0, this.currentHorizSpeed - 2);
    } else {
      this.currentHorizSpeed = Math.min(this.currentHorizSpeed + 2, targetSpeed);
    }
    const speed = this.currentHorizSpeed;
    this.deceleratingToTurn = false;
    // 推进朝向未对齐：算转弯圆——目的地落在圆内（转不过去）时
    // 减速调头（远距离/悬停）或切换悬停（直线状态）。
    if (thrustDelta) {
      const turnCircle = speed || thrustDelta
        ? TargetUtil.computeTurnCircle(
            mapPos as any,
            this.currentMoveDir as any,
            Math.sign(thrustDelta) * object.rules.rot,
            speed,
          )
        : undefined;
      // 在移动且目的地不在圆内 → 继续转；否则进入调头/悬停分支。
      if (!(0 !== speed && !geometryModule.circleContainsPoint(turnCircle, targetPos))) {
        if (this.maneuverType === WingedManeuverType.HoverStrafe || distance > Coords.LEPTONS_PER_TILE) {
          this.deceleratingToTurn = true;
        } else if (this.maneuverType === WingedManeuverType.None) {
          this.maneuverType = WingedManeuverType.HoverStrafe;
        }
      }
      horizontalSpeed = speed;
      horizDone = false;
    } else {
      // 推进朝向已对齐：全速直行，距离 ≤ 速度即到达。
      horizontalSpeed = Math.min(speed, distance);
      horizDone = distance <= speed;
    }
    // 合成本 tick 位移：距离 <1 或已到位 → 直接贴上目的地；
    // 否则沿推进方向走 horizontalSpeed。
    let moveTarget: Vector2;
    if (distance < 1) {
      horizDone = true;
      moveTarget = toTarget;
    } else if (horizDone) {
      moveTarget = toTarget;
    } else {
      moveTarget = this.currentMoveDir.clone().setLength(horizontalSpeed);
    }
    const moveVector = new Vector3(moveTarget.x, climbZ, moveTarget.y);
    object.moveTrait.velocity.copy(moveVector.clone());
    return { distance: moveVector, done: horizDone && verticalSettled };
  }

  /**
   * 计算取消移动时的降落点：目的地所在 tile 中心 + 原 tile 内偏移
   * （与 JumpjetLocomotor.computeCancelDest 相同的算法）。
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
