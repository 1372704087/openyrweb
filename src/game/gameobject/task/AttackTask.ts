/**
 * AttackTask — 攻击任务（武器开火的全流程状态机）。
 *
 * 攻击一个目标（单位/建筑/地形）的完整驱动，attackTrait.attackState
 * 五态循环：
 *  - CheckRange（查射程）：目标有效性/武器适配校验，算距离与冷却，
 *    决定"走近"（挂 MoveInWeaponRangeTask）还是"就位"；
 *  - PrepareToFire（准备开火）：位置稳定性复查（目标与自己都没挪窝）、
 *    朝向/炮塔对准（omniFire/战斗机能边飞边打、碾压攻击免对准）、
 *    LOS 复查、冷却/超时空/自爆检查、fireUp 前摇挂 WaitTicksTask；
 *  - FireUp（前摇）：前摇 tick 走完 → 进入 Firing；
 *  - Firing（开火）：进状态时做全套有效性复查（目标消失/换武器/
 *    出射程/无视线都打回 CheckRange），然后按顺序处理特殊开火路径
 *    ——驻军建筑（每名驻军各自开火）、OpenTopped 运载具（乘员独立
 *    开火且本体继续）、区域火力（areaFire 打自身格）——最后普通开火；
 *  - JustFired（刚开火）：转 PrepareToFire 继续下一轮。
 *
 * 特色机制（原版行为 + OpenYRWeb 扩展）：
 *  - 碾压攻击（attack-to-crush，yrmd sub_7414E0）：Crusher 对可碾压
 *    目标直接开过去边走边碾（火+碾并行），带停滞守卫（40 tick 没接近
 *    就放弃碾压改普通射击）；OmniCrusher 全程碾压、普通 Crusher 仅贴身；
 *  - 光棱塔支持束：主塔开火时让支持塔同步开火并叠加伤害倍率；
 *  - 磁电拖拽（magnetronDragging）免最小射程检查；
 *  - 心灵控制/寄生单位（limboLaunch）的目标丢弃规则；
 *  - 战斗机攻击跑位（completeRun 收尾）、气球悬浮/驻军/乘员各自开火。
 *
 * 常量：MAX_MOVE_ATTEMPTS=3（走位重试上限）、FACING_EPSILON=11.25°
 * （车身对准容差）、TURRET_FACING_EPSILON=45°（炮塔对准容差）。
 *
 * 由 game/gameobject/task/AttackTask.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标。
 */
import { Task } from "game/gameobject/task/system/Task"; // 已转换
import * as RangeHelperModule from "game/gameobject/unit/RangeHelper"; // 未转换（any-shim）
import { WaitMinutesTask } from "game/gameobject/task/system/WaitMinutesTask"; // 已转换
import { WeaponType } from "game/WeaponType"; // 已转换
import * as MoveInWeaponRangeTaskModule from "game/gameobject/task/move/MoveInWeaponRangeTask"; // 未转换（any-shim）
import * as FacingUtilModule from "game/gameobject/unit/FacingUtil"; // 已转换
import { TurnTask } from "game/gameobject/task/TurnTask"; // 已转换
import { WaitTicksTask } from "game/gameobject/task/system/WaitTicksTask"; // 已转换
import { AttackState } from "game/gameobject/trait/AttackTrait"; // 已转换
import { GameObject } from "game/gameobject/GameObject"; // 已转换
import * as LosHelperModule from "game/gameobject/unit/LosHelper"; // 未转换（any-shim）
import { MoveResult } from "game/gameobject/trait/MoveTrait"; // 已转换
import { GameSpeed } from "game/GameSpeed"; // 已转换
import { Coords } from "game/Coords"; // 已转换
import { ObjectType } from "engine/type/ObjectType"; // 已转换
import { RadialTileFinder } from "game/map/tileFinder/RadialTileFinder"; // 已转换
import * as MovePositionHelperModule from "game/gameobject/unit/MovePositionHelper"; // 未转换（any-shim）
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 已转换
import { MovementZone } from "game/type/MovementZone"; // 已转换
import { TaskStatus } from "game/gameobject/task/system/TaskStatus"; // 已转换
import { MoveTask } from "game/gameobject/task/move/MoveTask"; // 已转换
import { Vector3 } from "game/math/Vector3"; // 已转换
import { Vector2 } from "game/math/Vector2"; // 已转换

/** 走位重试上限：同一目标点连续走不到就放弃当前接近策略。 */
const MAX_MOVE_ATTEMPTS = 3;
/** 车身对准容差（度）：朝向差 < 11.25° 即视为已对准。 */
const FACING_EPSILON_DEGS = 11.25;
/** 炮塔对准容差（度）：4 × 车身容差 = 45°。 */
const TURRET_FACING_EPSILON_DEGS = 4 * FACING_EPSILON_DEGS;

/* eslint-disable @typescript-eslint/no-explicit-any */
export class AttackTask extends Task {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值（TS 字段初始化器
  // 会被提升，改变 Object.keys() 顺序）。
  game: any;
  /** 攻击目标（{obj?, tile, getBridge(), ...} 目标描述对象）。 */
  target: any;
  /** 当前使用的武器（可被 setWeapon / 自动换武器替换）。 */
  weapon: any;
  /** 选项（force 强攻 / passive 被动 / holdGround / leashTiles / disallowTurning 等）。 */
  options: any;
  moveExecuted: boolean;
  moveAttempts: number;
  /** OpenYRWeb：碾压接近失败（目标开不上去）→ 后续改普通射击。 */
  crushApproachFailed: boolean;
  /** OpenYRWeb：碾压接近停滞 tick 计数（40 tick 没接近就放弃碾压）。 */
  crushApproachStallTicks: number;
  /** OpenYRWeb：上一次碾压接近的距离（判断是否在接近）。 */
  lastCrushApproachDistance: number;
  rangeCheckCooldown: number;
  /** PrepareToFire 稳定性复查：上次入射程时的目标/自己位置。 */
  lastInRangeTargetPosition: Vector3;
  lastInRangeSelfPosition: Vector3;
  /** 目标是地形/覆盖物（间接目标）：目标格清空时自动放弃。 */
  initialIndirectTarget: boolean;
  forceDropTarget: boolean;
  rangeHelper: any;
  losHelper: any;
  targetLinesConfig: any;
  /** requestTargetUpdate 缓存的目标变更请求。 */
  needsTargetUpdate: any;
  /** 最后一次确认有效的目标位置（目标丢失时朝这里追）。 */
  lastValidTargetPosition: any;
  /** 开火瞬间目标的归属（防止目标被间谍/占领后继续攻击）。 */
  initialTargetOwner: any;
  initialSelfPosition: any;
  /** 上次目标瞬移检查的 tick（目标刚瞬移过 → 重新索敌）。 */
  lastTargetTpCheck: any;
  lastSelfTileBeforeMove: any;
  lastSelfMoveTargetTile: any;

  constructor(game: any, target: any, weapon: any, options: any = {}) {
    super();
    this.game = game;
    this.target = target;
    this.weapon = weapon;
    this.options = options;
    this.moveExecuted = false;
    this.moveAttempts = 0;
    // OpenYRWeb：碾压接近失败（目标不可达）时置位，让单位回退到普通
    // 射击而不是死循环。
    this.crushApproachFailed = false;
    // OpenYRWeb：碾压接近进度守卫——追踪碾压走位任务是否真的在缩短
    // 与可碾压目标（墙）的距离。停滞（停在目标旁却开不上去）就放弃
    // 碾压，回退普通射击。
    this.crushApproachStallTicks = 0;
    this.lastCrushApproachDistance = undefined;
    this.rangeCheckCooldown = 0;
    this.lastInRangeTargetPosition = new Vector3();
    this.lastInRangeSelfPosition = new Vector3();
    this.initialIndirectTarget = false;
    this.forceDropTarget = false;
    this.rangeHelper = new RangeHelperModule.RangeHelper(game.map.tileOccupation);
    this.losHelper = new LosHelperModule.LosHelper(game.map.tiles, game.map.tileOccupation);
    this.targetLinesConfig = { pathNodes: [] };
    this.updateTargetLines(this.target, true);
  }

  duplicate(): AttackTask {
    return new AttackTask(this.game, this.target, this.weapon, this.options);
  }

  getWeapon(): any {
    return this.weapon;
  }

  setWeapon(weapon: any): void {
    this.weapon = weapon;
  }

  setForceAttack(force: any): void {
    this.options.force = force;
  }

  /** 外部请求换目标（目标对象不同才缓存，下一 tick 处理）。 */
  requestTargetUpdate(target: any): void {
    if (!this.target.equals(target)) this.needsTargetUpdate = target;
  }

  /**
   * 目标切换生效：登记攻击状态（attackTrait.currentTarget）、记录
   * 目标初始位置与归属（防止易主后继续打）、判定是否间接目标
   * （打地形/覆盖物而非单位）、刷新目标线。
   */
  onTargetChange(object: any): void {
    const attackTrait = object.attackTrait;
    const target = this.target;
    attackTrait.currentTarget = target;
    this.lastValidTargetPosition = target.obj ? { tile: target.tile, onBridge: target.getBridge() } : undefined;
    this.initialTargetOwner = target.obj?.isTechno() ? target.obj.owner : undefined;
    this.initialIndirectTarget =
      !target.obj &&
      this.game.map.tileOccupation
        .getObjectsOnTile(target.tile)
        .some((obj: any) => (obj.isOverlay() && !obj.isBridgePlaceholder()) || obj.isTerrain());
    this.updateTargetLines(target, true);
  }

  /** 刷新调试目标线：有单位目标画到单位，否则画到 tile。 */
  updateTargetLines(target: any, isAttack: any): void {
    this.targetLinesConfig.target = target.obj;
    this.targetLinesConfig.pathNodes = target.obj ? [] : [{ tile: target.tile, onBridge: target.getBridge() }];
    this.targetLinesConfig.isAttack = isAttack;
  }

  /**
   * 任务启动：校验攻击特性与弹药，登记初始状态，处理 limboLaunch
   * （寄生/心灵控制类）武器的近身落点预搜；若是升空攻击的飞行单位
   * 且已在射程内，挂一个不可取消的原地 MoveTask 托住飞行。
   */
  onStart(object: any): void {
    if (!object.attackTrait) throw new Error(`Object ${object.name} has no attack trait`);
    if (object.ammo !== 0) {
      const tileOccupation = this.game.map.tileOccupation;
      object.attackTrait.attackState = AttackState.CheckRange;
      this.onTargetChange(object);
      this.initialSelfPosition = {
        tile: object.tile,
        onBridge: object.isUnit() && object.onBridge ? tileOccupation.getBridgeOnTile(object.tile) : undefined,
      };
      let reachable: any, fallback: any;
      // limboLaunch 打地面目标（寄生虫目标点）：预搜可近身落点。
      if (this.weapon.rules.limboLaunch && object.isUnit() && !this.target.obj) {
        this.forceDropTarget = true;
        ({ reachable, fallback } = this.findReachableMeleePosition(this.target.tile, !!this.target.getBridge(), { width: 1, height: 1 }, object));
        if (!reachable && fallback) {
          this.lastValidTargetPosition = fallback;
          this.updateTargetLines(this.game.createTarget(fallback.onBridge, fallback.tile), false);
        }
      }
      // limboLaunch 打单位目标：够不着就取消（有既定路径时）或改打落点。
      if (
        this.weapon.rules.limboLaunch &&
        this.target.obj?.isTechno() &&
        object.isUnit() &&
        !this.rangeHelper.isInWeaponRange(object, this.target.obj, this.weapon, this.game.rules)
      ) {
        ({ reachable, fallback } = this.findReachableMeleePosition(
          this.target.obj.tile,
          this.target.obj.isUnit() && this.target.obj.onBridge,
          this.target.obj.getFoundation(),
          object,
        ));
        if (!reachable) {
          if (1 < (object.unitOrderTrait.waypointPath?.waypoints?.length ?? 0)) {
            this.cancel();
          } else {
            this.forceDropTarget = true;
            if (fallback) {
              this.lastValidTargetPosition = fallback;
              this.updateTargetLines(this.game.createTarget(fallback.onBridge, fallback.tile), false);
            }
          }
        }
      }
      // 升空攻击的飞行单位已在射程内：挂原地飞行任务（悬停开火）。
      if (
        this.rangeHelper.isInWeaponRange(object, this.target.obj ?? this.target.tile, this.weapon, this.game.rules) &&
        object.isUnit() &&
        object.rules.movementZone === MovementZone.Fly &&
        object.zone !== ZoneType.Air &&
        (object.rules.hoverAttack || (object.isAircraft() && !object.rules.fighter))
      ) {
        this.children.push(new MoveTask(this.game, object.tile, false).setCancellable(false));
      }
    } else {
      this.cancel();
    }
  }

  /**
   * 搜可近身位置（limboLaunch 用）：从目标径向 1~range 格找既在武器
   * 射程内、又可通行的落点。reachable = 首个完全合格的 tile；
   * fallback = 途中第一个可通行 tile（射程判定失败时的备用落点）。
   */
  findReachableMeleePosition(targetTile: any, targetOnBridge: any, foundation: any, object: any): any {
    const map = this.game.map;
    const tileOccupation = map.tileOccupation;
    const targetBridge = targetOnBridge ? tileOccupation.getBridgeOnTile(targetTile) : undefined;
    const movePositionHelper = new MovePositionHelperModule.MovePositionHelper(map);
    const isFly = object.rules.movementZone === MovementZone.Fly;
    const isPassable = (tile: any, bridge: any) =>
      isFly ||
      (0 < map.terrain.getPassableSpeed(tile, object.rules.speedType, object.isInfantry(), !!bridge) &&
        movePositionHelper.isEligibleTile(tile, bridge, targetBridge, targetTile) &&
        !map.terrain.findObstacles({ tile, onBridge: bridge }, object).length);
    let fallback: any;
    const finder = new RadialTileFinder(map.tiles, map.mapBounds, targetTile, foundation, 1, Math.ceil(this.weapon.rules.range), (tile: any) => {
      let ok = false;
      // 地面候选 → 记为 fallback；
      if (isPassable(tile, undefined)) {
        fallback = fallback ?? { tile, onBridge: undefined };
        ok = true;
      }
      // 桥面候选（tile 在桥上时另测一次）。
      if (undefined !== tile.onBridgeLandType) {
        const bridge = tileOccupation.getBridgeOnTile(tile);
        if (isPassable(tile, bridge)) {
          fallback = fallback ?? { tile, onBridge: bridge };
          ok = true;
        }
      }
      return !!ok && this.rangeHelper.isInWeaponRange(object, targetTile, this.weapon, this.game.rules, tile);
    });
    return { reachable: finder.getNextTile(), fallback };
  }

  /**
   * 任务收尾：清强攻状态与当前目标、炮塔回正、攻击状态归 Idle、
   * 光棱主塔收束支持塔、limboLaunch 恢复被动扫描冷却、熄火标志、
   * 重置连发；OpenYRWeb：仅对盖特拉克单位停掉循环开火音效
   * （多份 Report 实例逐个停，避免截断单发音效）。
   */
  onEnd(object: any): void {
    object.isForceAttacking = false;
    object.currentAttackTarget = undefined;
    if (object.isVehicle() && object.turretTrait) object.turretTrait.desiredFacing = object.direction;
    object.attackTrait.attackState = AttackState.Idle;
    object.attackTrait.currentTarget = undefined;
    const prismType = this.game.rules.general.prism.type;
    if (object.isBuilding() && object.name === prismType && this.weapon.type !== WeaponType.Secondary) {
      this.countSupportBeamsAndFireDownTowers(object, prismType);
    }
    if (this.weapon.rules.limboLaunch) object.attackTrait.expirePassiveScanCooldown();
    if (object.isInfantry() || object.isVehicle()) object.isFiring = false;
    if (this.weapon.hasBurstsLeft()) this.weapon.resetBursts();
    // OpenYRWeb：攻击结束时停掉循环武器音效。只有盖特拉克单位才做
    // （__weaponFireSound 对所有带 Report 的武器都会设置，一刀切会
    // 截断单发音效；盖特拉克可能同时有多份实例，全部遍历停止）。
    try {
      if (object.gattlingTrait) {
        if (object.__weaponFireSounds && object.__weaponFireSounds.length) {
          for (let i = 0; i < object.__weaponFireSounds.length; i++) {
            if (object.__weaponFireSounds[i].isPlaying()) object.__weaponFireSounds[i].stop();
          }
          object.__weaponFireSounds.length = 0;
        }
        if (object.__weaponFireSound && object.__weaponFireSound.isPlaying()) {
          object.__weaponFireSound.stop();
          object.__weaponFireSound = undefined;
        }
      }
    } catch (err) {}
  }

  /**
   * 强制取消（仅飞行单位：攻击中不允许被普通指令打断，飞行攻击除外）。
   * 运行中要先强制取消所有 MoveTask 子任务并触发 onEnd。
   */
  forceCancel(object: any): boolean {
    if (object.rules.movementZone !== MovementZone.Fly) return false;
    if (!this.cancellable || this.children.some((child: any) => !child.cancellable)) return false;
    if (this.status === TaskStatus.Running || this.status === TaskStatus.Cancelling) {
      if (
        this.children
          .filter((child: any) => child instanceof MoveTask)
          .some((child: any) => !child.forceCancel(object))
      )
        return false;
      this.onEnd(object);
      if (object.isInfantry() || object.isVehicle()) object.isFiring = false;
    }
    this.status = TaskStatus.Cancelled;
    return true;
  }

  /**
   * 每 tick 驱动（核心状态机，见类注释）。返回 true 表示任务结束。
   */
  onTick(object: any): boolean {
    const attackTrait = object.attackTrait;
    // 开火姿态只在 Firing 态保持；其它状态一律熄灭开火标志。
    if ((object.isInfantry() || object.isVehicle()) && attackTrait.attackState !== AttackState.Firing) {
      object.isFiring = false;
    }
    let targetObj = this.target.obj;
    const moveInRangeChild = this.children.find((child: any) => child instanceof MoveInWeaponRangeTaskModule.MoveInWeaponRangeTask);
    const magDragging = object.magnetronDragging === targetObj;

    // 取消流程：非前摇态直接取消接近子任务并结束（导弹发射中除外）。
    if (this.isCancelling() && attackTrait.attackState !== AttackState.FireUp) {
      if (object.airSpawnTrait?.isLaunchingMissiles()) return false;
      moveInRangeChild?.cancel();
      return true;
    }
    let transitionedToFireUp = false;
    if (attackTrait.attackState === AttackState.FireUp) {
      // 前摇期间被瘫痪 → 任务结束（打不出这一发了）。
      if (attackTrait.isDisabled()) return true;
      attackTrait.attackState = AttackState.Firing;
      transitionedToFireUp = true;
    }

    // ============ Firing：开火态 ============
    if (attackTrait.attackState === AttackState.Firing) {
      // 间接目标（地形/覆盖物）已被摧毁 → 重新评估。
      if (
        this.initialIndirectTarget &&
        !this.game.map
          .getObjectsOnTile(this.target.tile)
          .find((obj: any) => (obj.isOverlay() && !obj.isBridgePlaceholder()) || obj.isTerrain())
      ) {
        this.cancel();
        return this.onTick(object);
      }
      if (transitionedToFireUp) {
        // 前摇刚结束的全套复查，任何一项不满足都打回 CheckRange。
        if (
          this.weapon.rules.drainWeapon &&
          this.target.obj?.isBuilding() &&
          !(object.tile.rx === this.target.obj.centerTile.rx && object.tile.ry === this.target.obj.centerTile.ry)
        ) {
          // OpenYRWeb：吸血武器必须停在建筑中心格（碟形飞行器放电）。
          attackTrait.attackState = AttackState.CheckRange;
          return this.onTick(object);
        }
        if (
          !this.game.isValidTarget(this.target.obj) ||
          this.shouldDropTarget(this.target.obj, object) ||
          (magDragging
            ? false
            : // OpenYRWeb：狂暴单位绕过 canTarget（可攻击包括友方在内的一切单位）。
              !object.berserkTrait?.isBerserk() &&
              !this.weapon.targeting.canTarget(
                this.target.obj,
                this.target.tile,
                this.game,
                !!this.options.force,
                !!this.options.passive,
              )) ||
          (!magDragging && !this.rangeHelper.isInWeaponRange(object, this.target.obj || this.target.tile, this.weapon, this.game.rules)) ||
          !this.losHelper.hasLineOfSight(object, this.target.obj || this.target.tile, this.weapon)
        ) {
          attackTrait.attackState = AttackState.CheckRange;
          return this.onTick(object);
        }
      }
      // limboLaunch（寄生/心灵控制）：目标已被寄生、或地面单位打空中
      // 寄生目标 → 放弃。
      if (this.weapon.rules.limboLaunch) {
        if ((targetObj?.isVehicle() || targetObj?.isAircraft()) && targetObj.parasiteableTrait?.isInfested()) return true;
        if (object.rules.movementZone !== MovementZone.Fly && targetObj?.isUnit() && targetObj.zone === ZoneType.Air) return true;
      }
      // 高架桥高度差：攻击者与目标不在同一层（桥上/桥下/空中）→ 打不着。
      if (
        this.target.tile.onBridgeLandType &&
        object.tile.onBridgeLandType &&
        object.isUnit() &&
        (this.game.map.tileOccupation.getBridgeOnTile(this.target.tile)?.isHighBridge() ||
          this.game.map.tileOccupation.getBridgeOnTile(object.tile)?.isHighBridge())
      ) {
        const targetHigh = targetObj
          ? targetObj.isUnit() && (targetObj.zone === ZoneType.Air || targetObj.onBridge)
          : this.target.isBridge();
        if (targetHigh !== (object.zone === ZoneType.Air || object.onBridge)) return true;
      }
      // 光棱主塔：统计支持束并计算伤害倍率（1 + 支持塔数 × 增幅）。
      let damageMultiplier = 1;
      const prismType = this.game.rules.general.prism.type;
      if (object.isBuilding() && object.name === prismType && this.weapon.type !== WeaponType.Secondary) {
        const supportCount = this.countSupportBeamsAndFireDownTowers(object, prismType);
        damageMultiplier = 1 + supportCount * this.game.rules.general.prism.supportModifier;
      }
      // spawner 武器打瘫痪目标（寄生中）→ 不开火。
      if (this.weapon.rules.spawner && (object.isVehicle() || object.isAircraft()) && object.parasiteableTrait?.isParalyzed()) {
        return true;
      }
      if (object.ammo === 0) {
        // OpenYRWeb：战斗机打完最后一发时不要就地取消走位任务（会让飞机
        // 急停悬停）——completeRun 让攻击跑位自然飞过目标；非战斗机保留
        // 原版的延迟取消（轰炸机先飞完机动格）。
        if (object.rules.fighter && moveInRangeChild) {
          moveInRangeChild.completeRun(object, this.target.obj ?? this.target.tile, this.options.airstrikeExitTile);
          return true;
        }
        moveInRangeChild?.cancel();
        return true;
      }
      // limboLaunch：接管单位当前 MoveTask 强制取消（寄生Unit贴身）。
      let cancelledMoveChild = false;
      if (this.weapon.rules.limboLaunch) {
        let moveChild = moveInRangeChild;
        if (!moveChild) {
          const currentTask = object.unitOrderTrait.getCurrentTask();
          if (currentTask && currentTask !== this && attackTrait.getOpportunityFireTask() === this) {
            if (!(currentTask instanceof MoveTask)) {
              currentTask.cancel();
              return false;
            }
            moveChild = currentTask;
          }
        }
        if (moveChild) {
          if (!moveChild.forceCancel(object)) return false;
          object.moveTrait.lastTargetOffset = undefined;
          object.moveTrait.lastVelocity = undefined;
        }
        cancelledMoveChild = true;
      }
      // OpenYRWeb：驻军建筑——每名驻军用自己的武器独立开火（各自 ROF）。
      if (object.isBuilding() && object.garrisonTrait && object.garrisonTrait.isOccupied()) {
        for (const occupant of object.garrisonTrait.units) {
          const occupantWeapon = occupant.armedTrait?.getGarrisonWeapon();
          if (
            occupantWeapon &&
            occupantWeapon.getCooldownTicks() === 0 &&
            occupantWeapon.targeting.canTarget(this.target.obj, this.target.tile, this.game, !!this.options.force, !!this.options.passive)
          ) {
            occupantWeapon.fire(this.target, this.game, 1);
          }
        }
        attackTrait.attackState = AttackState.JustFired;
        return false;
      }
      // OpenYRWeb：OpenTopped 运载具（战斗要塞）——乘员独立开火，本体
      // 武器继续走普通开火路径（不 return）；行进间也可开火。乘员加成
      // 在 Weapon.fire / 射程计算内部通过 transport 回引实现。
      if (object.transportTrait && object.rules.openTopped && object.transportTrait.units.length) {
        const openToppedTarget = this.target.obj || this.target.tile;
        for (const passenger of object.transportTrait.units) {
          // OpenYRWeb：用 OpenTransportWeapon（GGI 在要塞上用导弹而非机枪）。
          const passengerWeapon = passenger.armedTrait?.getOpenToppedWeapon();
          if (
            passengerWeapon &&
            passengerWeapon.getCooldownTicks() === 0 &&
            passengerWeapon.targeting.canTarget(this.target.obj, this.target.tile, this.game, !!this.options.force, !!this.options.passive) &&
            // 每名乘员独立检查射程与视线（乘员 1 射程 8+2 打得到时，
            // 乘员 2 射程 3+2 打不到就不开）。
            this.rangeHelper.isInWeaponRange(object, openToppedTarget, passengerWeapon, this.game.rules) &&
            this.losHelper.hasLineOfSight(object, openToppedTarget, passengerWeapon)
          ) {
            passengerWeapon.fire(this.target, this.game, 1);
          }
        }
        // 若 selectWeaponVersus 选中的就是某乘员的武器（已开过火），
        // 跳过普通开火避免双发（如要塞机枪打不到飞机时选中 GGI 导弹）。
        if (object.transportTrait.units.some((passenger: any) => passenger.armedTrait?.getOpenToppedWeapon() === this.weapon)) {
          attackTrait.attackState = AttackState.JustFired;
          return false;
        }
      }
      // OpenYRWeb：FireWhileMoving=no——必须完全停稳才能开火（碟形
      // 飞行器放电 ROF=50）；移动中保持 Firing 等待，不消耗弹药。
      if (!this.weapon.rules.fireWhileMoving && object.moveTrait && object.moveTrait.isMoving()) return false;
      // OpenYRWeb：断电的建筑防御无法开火（被碟形飞行器吸电/低电力）。
      if (object.isBuilding() && object.poweredTrait && !object.poweredTrait.isPoweredOn()) return false;
      // OpenYRWeb：AreaFire=yes 的武器打自己所在格（毒气从自身位置扩散，
      // 如混沌无人机），与原版部署后区域火力一致。
      const areaFireTarget = this.weapon.rules.areaFire ? this.game.createTarget(undefined, object.position.tile) : this.target;
      const fireResult = this.weapon.fire(areaFireTarget, this.game, damageMultiplier);
      if (fireResult) return true;
      if (this.weapon.rules.fireOnce && !this.weapon.rules.drainWeapon) return true;
      if (this.options.passive && object.rules.distributedFire) return true;
      attackTrait.attackState = AttackState.JustFired;
      return false;
    }

    // ============ JustFired：转回准备开火 ============
    if (attackTrait.attackState === AttackState.JustFired) {
      attackTrait.attackState = AttackState.PrepareToFire;
      return this.onTick(object);
    }

    // ============ 目标更新 / 换目标 / 目标被替换或摧毁 ============
    if (this.needsTargetUpdate) {
      this.target = this.needsTargetUpdate;
      targetObj = this.target.obj;
      this.needsTargetUpdate = undefined;
      this.onTargetChange(object);
      if (!targetObj) moveInRangeChild?.retarget(this.target.tile, !!this.target.getBridge());
    }
    if (targetObj?.isTechno() && targetObj.replacedBy) {
      // 目标被替换（如建筑被重新部署）→ 转移目标。
      const replacement = this.game.createTarget(targetObj.replacedBy, targetObj.replacedBy.tile);
      this.target = replacement;
      targetObj = targetObj.replacedBy;
      this.onTargetChange(object);
    }
    // OpenYRWeb：接近途中目标被毁 → 立即中止（飞机直奔出口而不是飞到
    // 废墟上空才转向）。
    if (targetObj && targetObj.isDestroyed) {
      this.cancel();
      return this.onTick(object);
    }
    let targetValid = this.game.isValidTarget(targetObj) && !this.shouldDropTarget(targetObj, object);
    if (targetValid && !magDragging) {
      // OpenYRWeb：狂暴单位绕过 canTarget。
      let canAttack =
        object.berserkTrait?.isBerserk() ||
        this.weapon.targeting.canTarget(targetObj, this.target.tile, this.game, !!this.options.force, !!this.options.passive);
      if (!canAttack || !object.armedTrait.isEquippedWithWeapon(this.weapon)) {
        // 当前武器打不了（或没装备）→ 自动换合适武器。
        const betterWeapon = attackTrait.selectWeaponVersus(object, this.target, this.game, this.options.force, this.options.passive);
        if (betterWeapon) {
          this.setWeapon(betterWeapon);
          if (attackTrait.attackState !== AttackState.CheckRange) {
            attackTrait.attackState = AttackState.CheckRange;
            return this.onTick(object);
          }
          canAttack = true;
        } else {
          canAttack = false;
        }
      }
      targetValid = canAttack;
    }
    if (targetValid) {
      // 目标刚瞬移过 → 视为丢失（重置走位冷却重新索敌）。
      const lastTpCheck = this.lastTargetTpCheck;
      if (targetObj?.isUnit() && lastTpCheck && targetObj.moveTrait.lastTeleportTick >= lastTpCheck) {
        targetValid = false;
        this.rangeCheckCooldown = 0;
      } else {
        this.lastTargetTpCheck = this.game.currentTick;
      }
    }
    if (targetValid && targetObj) {
      this.lastValidTargetPosition = { tile: targetObj.tile, onBridge: this.target.getBridge() };
    }
    if (!targetValid) this.targetLinesConfig.isAttack = false;

    // ============ CheckRange：查射程 / 走位决策 ============
    // crushTarget 按孪生 var 语义在函数级可见（PrepareToFire 也读）。
    let crushTarget = false;
    if (attackTrait.attackState === AttackState.CheckRange) {
      // 有效目标用其本体，丢失时用最后有效位置。
      const approachTile = this.target.obj ? (targetValid ? this.target.obj : this.lastValidTargetPosition.tile) : this.target.tile;
      // OpenYRWeb：OpenTopped 乘员在 CheckRange（接近中）也每 tick 独立
      // 开火——必须在射程冷却 early-return 之前（否则车体接近途中乘员
      // 永远打不了）。
      if (targetValid && !magDragging && object.transportTrait && object.rules.openTopped && object.transportTrait.units.length) {
        for (const passenger of object.transportTrait.units) {
          const passengerWeapon = passenger.armedTrait?.getOpenToppedWeapon();
          if (
            passengerWeapon &&
            passengerWeapon.getCooldownTicks() === 0 &&
            passengerWeapon.targeting.canTarget(this.target.obj, this.target.tile, this.game, !!this.options.force, !!this.options.passive) &&
            this.rangeHelper.isInWeaponRange(object, approachTile, passengerWeapon, this.game.rules) &&
            this.losHelper.hasLineOfSight(object, approachTile, passengerWeapon)
          ) {
            passengerWeapon.fire(this.target, this.game, 1);
          }
        }
      }
      if (this.rangeCheckCooldown > 0) {
        this.rangeCheckCooldown--;
        return false;
      }
      // 射程参照点：建筑取中心格；目标丢失用最后有效位置。
      const rangeCheckTile = this.target.obj
        ? targetValid
          ? this.target.obj.isBuilding()
            ? this.target.obj.centerTile
            : this.target.obj.tile
          : this.lastValidTargetPosition.tile
        : this.target.tile;
      // OpenYRWeb：磁电拖拽跳过最小射程（目标在被拖进来，不需要后退），
      // 但仍检查最大射程（目标被超时空传送走就追或结束）。
      let inRange: boolean;
      if (magDragging) {
        inRange = this.rangeHelper.isInRange(object, approachTile, 0, this.weapon.range, false);
      } else {
        inRange = this.rangeHelper.isInWeaponRange(object, approachTile, this.weapon, this.game.rules);
      }
      // OpenYRWeb：吸血武器必须停在建筑中心格——即使射程覆盖也强制
      // 重新定位，避免 Firing 检查打回 CheckRange 造成死循环。
      if (inRange && this.weapon.rules.drainWeapon && this.target.obj?.isBuilding()) {
        const centerTile = this.target.obj.centerTile;
        inRange = object.tile.rx === centerTile.rx && object.tile.ry === centerTile.ry;
      }
      // OpenYRWeb：碾压攻击（原版 yrmd sub_7414E0）——Crusher 直接开上
      // 可碾压的地面目标（战斗要塞碾步兵/坦克/墙；强制攻击友方墙也算）。
      // 空中目标排除；OmniCrusher 任意距离都碾，普通 Crusher 仅贴身碾。
      crushTarget = !!(
        targetObj &&
        (!targetObj.isBuilding() || targetObj.rules.wall) &&
        (!targetObj.isUnit() || targetObj.zone !== ZoneType.Air) &&
        object.isUnit() &&
        object.canCrushObject(targetObj) &&
        !this.crushApproachFailed &&
        (object.omniCrusher || this.rangeHelper.tileDistance(object, targetObj) <= 1)
      );
      // 不在射程 / 无视线 / （碾压目标）还没挂走位任务 / （飞机）还没挂
      // 跑位任务 → 走位分支。
      const needsApproach = crushTarget
        ? !inRange || !this.losHelper.hasLineOfSight(object, approachTile, this.weapon) || !moveInRangeChild
        : !inRange ||
          !this.losHelper.hasLineOfSight(object, approachTile, this.weapon) ||
          // OpenYRWeb：飞机轰炸接近（基洛夫垂直投弹、战斗机蛇形）——
          // 气球悬浮碟走普通坦克路径。
          (object.isAircraft() && !moveInRangeChild && (this.weapon.projectileRules.iniRot <= 1 || object.rules.fighter));
      if (needsApproach) {
        if (object.isUnit() && !this.options.holdGround && this.game.map.isWithinBounds(rangeCheckTile)) {
          if (moveInRangeChild) {
            // 已有接近任务：目标移动了就改目标。
            if (moveInRangeChild.target !== this.target.obj || targetValid) {
              const shouldRetarget =
                targetValid &&
                this.target.obj &&
                // OpenYRWeb：碾压攻击在目标移动时立即改目标（追当前 tile
                // 而不是先开到旧坐标再掉头）；普通攻击按距离阈值改。
                (crushTarget
                  ? this.target.obj.tile !== this.lastSelfMoveTargetTile
                  : this.rangeHelper.tileDistance(this.target.obj, this.lastSelfMoveTargetTile) > this.weapon.range);
              if (shouldRetarget) {
                moveInRangeChild.retarget(this.target.obj, !!this.target.getBridge());
                this.lastSelfTileBeforeMove = object.tile;
                this.lastSelfMoveTargetTile = this.target.obj?.tile ?? this.target.tile;
                // OpenYRWeb：碾压任务刚改目标，本 tick 等它执行。
                if (crushTarget) return false;
              } else {
                // 超出拴绳距离 → 取消接近并结束（被动攻击防追出太远）。
                if (
                  undefined !== this.options.leashTiles &&
                  this.rangeHelper.tileDistance(this.initialSelfPosition.tile, object.tile) > this.options.leashTiles
                ) {
                  moveInRangeChild.cancel();
                  return true;
                }
                // 估算追上目标的 tick 数 → 设置射程重查冷却。
                const targetSpeed = approachTile instanceof GameObject && approachTile.isUnit() ? (approachTile as any).moveTrait.baseSpeed : 0;
                const catchUpTicks = Math.ceil(
                  (this.rangeHelper.tileDistance(object, approachTile) - (this.weapon.range + 1)) /
                    ((object.moveTrait.baseSpeed + targetSpeed) / Coords.LEPTONS_PER_TILE),
                );
                if (0 < catchUpTicks) this.rangeCheckCooldown = Math.min(GameSpeed.BASE_TICKS_PER_SECOND, catchUpTicks);
                // OpenYRWeb：碾压接近停滞守卫——40 tick 没接近就放弃碾压，
                // 让 moveAttempts 回退逻辑接管（改普通射击）。
                const currentDistance = this.rangeHelper.tileDistance(object, approachTile);
                if (undefined === this.lastCrushApproachDistance || currentDistance < this.lastCrushApproachDistance) {
                  this.lastCrushApproachDistance = currentDistance;
                  this.crushApproachStallTicks = 0;
                } else if (40 < ++this.crushApproachStallTicks) {
                  moveInRangeChild.cancel();
                  this.lastCrushApproachDistance = undefined;
                  this.crushApproachStallTicks = 0;
                  this.moveAttempts = MAX_MOVE_ATTEMPTS + 1;
                }
                if (crushTarget) return false;
              }
            } else {
              // 接近任务还在但没到改目标条件：拴绳超限 → 回出发点。
              let newTarget;
              if (undefined !== this.options.leashTiles) {
                newTarget = this.game.createTarget(this.initialSelfPosition.onBridge, this.initialSelfPosition.tile);
              } else {
                newTarget = this.game.createTarget(this.lastValidTargetPosition.onBridge, this.lastValidTargetPosition.tile);
              }
              attackTrait.currentTarget = newTarget;
              moveInRangeChild.retarget(newTarget.tile, newTarget.isBridge());
              this.updateTargetLines(newTarget, false);
            }
            return false;
          }
          // 没有接近任务：走位次数超限 → 放弃碾压改普通射击；否则挂
          // WaitMinutes 让一步后再挂 MoveInWeaponRangeTask。
          if (!object.moveTrait || object.moveTrait.isDisabled()) return true;
          if (this.isCancelling()) return true;
          if (
            object.tile === this.lastSelfTileBeforeMove ||
            (this.moveExecuted && object.moveTrait.lastMoveResult === MoveResult.Fail)
          ) {
            this.moveAttempts++;
          } else {
            this.moveAttempts = 0;
          }
          if (
            this.weapon.rules.limboLaunch &&
            object.defaultToGuardArea &&
            targetObj &&
            this.moveExecuted &&
            object.moveTrait.lastMoveResult === MoveResult.Fail &&
            this.rangeHelper.isInRange(object, targetObj, 0, object.armedTrait.computeGuardScanRange(this.weapon), true)
          ) {
            return true;
          }
          if (this.moveAttempts > MAX_MOVE_ATTEMPTS) {
            // OpenYRWeb：碾压目标开不上去 → 回退普通射击（不要终止任务，
            // 否则贴墙的碾压单位既不碾也不打）；重置计数。
            this.crushApproachFailed = true;
            this.moveAttempts = 0;
            return false;
          }
          if (0 < this.moveAttempts) this.children.push(new WaitMinutesTask(1 / 60));
          const moveTarget = approachTile;
          const moveTargetBridge = targetObj && !targetValid ? this.lastValidTargetPosition.onBridge : this.target.getBridge();
          const newMoveChild = new MoveInWeaponRangeTaskModule.MoveInWeaponRangeTask(this.game, moveTarget, !!moveTargetBridge, this.weapon, crushTarget);
          newMoveChild.blocking = false;
          this.children.push(newMoveChild);
          this.moveExecuted = true;
          this.lastSelfTileBeforeMove = object.tile;
          this.lastSelfMoveTargetTile = moveTarget instanceof GameObject ? moveTarget.tile : moveTarget;
          return this.onTick(object);
        }
        // OpenYRWeb：holdGround 的 OpenTopped 运载具——本体够不着但乘员
        // 可能够得着：保持 CheckRange 让乘员继续开火（不结束任务）。
        if (object.transportTrait && object.rules.openTopped && object.transportTrait.units.length) {
          for (const passenger of object.transportTrait.units) {
            const passengerWeapon = passenger.armedTrait?.getOpenToppedWeapon();
            if (
              passengerWeapon &&
              this.rangeHelper.isInWeaponRange(object, approachTile, passengerWeapon, this.game.rules) &&
              this.losHelper.hasLineOfSight(object, approachTile, passengerWeapon)
            ) {
              return false;
            }
          }
        }
        return true;
      }
      // 就位：重置走位计数；取消接近任务转 PrepareToFire。
      this.moveExecuted = false;
      this.moveAttempts = 0;
      // OpenYRWeb：入射程后取消接近任务并开火（坦克/光棱同款）。碟形
      // 飞行器不能保留走位任务（会在射程边缘徘徊）。战斗机/召唤物保留
      // 走位子任务让跑位飞完；飞行单位低于最小射程时保留（继续拉开）；
      // 碾压攻击保留走位让火+碾并行。
      if (moveInRangeChild) {
        const keepMoveChild =
          object.rules.fighter ||
          object.rules.spawned ||
          (object.rules.movementZone === MovementZone.Fly &&
            !this.rangeHelper.isInRange2(object, this.target.obj ?? this.target.tile, this.weapon.minRange, this.weapon.range - 1));
        if (!keepMoveChild && !crushTarget) moveInRangeChild.cancel();
      }
      if (moveInRangeChild && (object.isInfantry() || this.weapon.rules.spawner)) return false;
      if (moveInRangeChild?.children.some((child: any) => !child.cancellable) && this.weapon.rules.limboLaunch) return false;
      if (
        moveInRangeChild &&
        moveInRangeChild.shouldAirStrafe(object) &&
        this.target.obj?.isUnit() &&
        this.target.obj.moveTrait.isMoving() &&
        1 < this.weapon.range &&
        !this.rangeHelper.isInRange2(object, this.target.obj, this.weapon.minRange, this.weapon.range - 1)
      ) {
        return false;
      }
      attackTrait.attackState = AttackState.PrepareToFire;
    }

    // ============ PrepareToFire：准备开火 ============
    if (attackTrait.attackState !== AttackState.PrepareToFire) return false;
    if (!targetValid || attackTrait.isDisabled()) {
      moveInRangeChild?.cancel();
      return true;
    }
    const targetWorldCoords = this.target.getWorldCoords();
    const selfWorldPosition = object.position.worldPosition;
    // 位置稳定性复查：目标和自己相对上次入射程时都没挪窝才算站定
    // （OpenYRWeb：碾压攻击免检——边开边碾）。
    if (
      !crushTarget &&
      !(
        this.lastInRangeTargetPosition.length() &&
        this.lastInRangeTargetPosition.equals(targetWorldCoords) &&
        this.lastInRangeSelfPosition.length() &&
        this.lastInRangeSelfPosition.equals(selfWorldPosition)
      )
    ) {
      this.lastInRangeTargetPosition.copy(targetWorldCoords);
      this.lastInRangeSelfPosition.copy(selfWorldPosition);
      attackTrait.attackState = AttackState.CheckRange;
      return this.onTick(object);
    }
    // 朝向对准：omniFire 武器/战斗机/碾压攻击免对准。
    if (!(this.weapon.rules.omniFire || (object.rules.omniFire && object.rules.fighter) || crushTarget)) {
      const toTarget = new Vector3().copy(targetWorldCoords).sub(selfWorldPosition);
      const desiredFacing = FacingUtilModule.FacingUtil.fromMapCoords(new Vector2(toTarget.x, toTarget.z));
      const facingEpsilon = this.weapon.projectileRules.rot ? TURRET_FACING_EPSILON_DEGS : FACING_EPSILON_DEGS;
      if ((object.isVehicle() || object.isBuilding()) && object.turretTrait && !object.rules.turretSpins) {
        // 炮塔对准（车身不动）。
        object.turretTrait.desiredFacing = desiredFacing;
        if (Math.abs(desiredFacing - object.turretTrait.facing) >= facingEpsilon) return false;
      } else if (Math.abs(desiredFacing - object.direction) >= facingEpsilon) {
        // 车身对准：飞机边转边打；载具挂 TurnTask；步兵直接转向。
        if (object.isAircraft()) {
          object.direction = FacingUtilModule.FacingUtil.tick(object.direction, desiredFacing, object.rules.rot).facing;
          return false;
        }
        if (moveInRangeChild) return false;
        if (this.options.disallowTurning) return true;
        if (object.isVehicle()) {
          this.children.push(new TurnTask(desiredFacing));
          return false;
        }
        object.direction = desiredFacing;
      }
    }
    if (!this.losHelper.hasLineOfSight(object, this.target.obj || this.target.tile, this.weapon)) {
      attackTrait.attackState = AttackState.CheckRange;
      return this.onTick(object);
    }
    if (attackTrait.isOnCooldown(object)) return false;
    // 超时空武器已锁定该目标 → 不重复发射。
    if (this.weapon.warhead.rules.temporal && object.temporalTrait.getTarget() === this.target.obj) return false;
    // 自爆武器（非死亡武器槽）→ 自毁并结束。
    if (this.weapon.rules.suicide && this.weapon.type !== WeaponType.DeathWeapon) {
      this.game.destroyObject(object, { player: object.owner, obj: object, weapon: this.weapon });
      return true;
    }
    // 光棱主塔：让支持塔同步开火。
    const prismType = this.game.rules.general.prism.type;
    if (object.isBuilding() && object.name === prismType && this.weapon.type !== WeaponType.Secondary) {
      this.fireUpPrismSupportTowers(object, prismType);
    }
    if (object.isInfantry() || object.isVehicle()) object.isFiring = true;
    if (object.art.fireUp) {
      // 前摇（步兵举枪/发射器充能）：被压制时不开火只进前摇态。
      if (!(object.isInfantry() && object.suppressionTrait?.isSuppressed())) {
        this.children.push(new WaitTicksTask(object.art.fireUp).setCancellable(false));
      }
      attackTrait.attackState = AttackState.FireUp;
      return false;
    }
    attackTrait.attackState = AttackState.Firing;
    return this.onTick(object);
  }

  /**
   * 是否应丢弃当前目标：强丢了（limboLaunch 落点预搜失败）、目标已
   * 被寄生/无敌（limboLaunch）、目标被超时空冻结且自己不是碾压单位
   * （OpenYRWeb：碾压是绝对击杀，可碾碎冻结目标）、或目标易主。
   */
  shouldDropTarget(target: any, attacker: any): boolean {
    if (this.forceDropTarget) return true;
    if (!target?.isTechno()) return false;
    if (this.weapon.rules.limboLaunch) {
      if (((target.isVehicle() || target.isAircraft()) && target.parasiteableTrait?.isInfested()) || target.invulnerableTrait.isActive()) {
        return true;
      }
    }
    if (
      target.warpedOutTrait.isInvulnerable() &&
      !this.weapon.warhead.rules.temporal &&
      // OpenYRWeb：碾压单位攻击可碾压目标时不因目标被冻结而丢弃
      // （原版：碾过被超时空军团冻结的目标直接摧毁）；非碾压单位仍丢弃。
      !(attacker?.isUnit() && attacker.crusher && attacker.canCrushObject(target))
    ) {
      return true;
    }
    return this.initialTargetOwner !== target.owner;
  }

  /** 光棱主塔开火时：命令射程内的支持塔同步开火（被动攻击任务）。 */
  fireUpPrismSupportTowers(tower: any, prismType: any): void {
    const supporters = tower.owner
      .getOwnedObjectsByType(ObjectType.Building)
      .filter(
        (building: any) =>
          building.name === prismType &&
          building.secondaryWeapon &&
          !building.unitOrderTrait.hasTasks() &&
          building.attackTrait &&
          !building.attackTrait.isDisabled() &&
          !building.attackTrait.isOnCooldown(building),
      )
      .filter((building: any) => this.rangeHelper.isInWeaponRange(building, tower, building.secondaryWeapon, this.game.rules))
      .slice(0, this.game.rules.general.prism.supportMax);
    for (const supporter of supporters) {
      supporter.unitOrderTrait.addTask(
        supporter.attackTrait.createAttackTask(this.game, tower, tower.centerTile, supporter.secondaryWeapon, { passive: true }),
      );
    }
  }

  /** 统计正在为主塔提供支持束的塔数（取消它们的任务），返回支持束数。 */
  countSupportBeamsAndFireDownTowers(tower: any, prismType: any): number {
    const supporters = tower.owner
      .getOwnedObjectsByType(ObjectType.Building)
      .filter((building: any) => building.name === prismType && building.attackTrait?.currentTarget?.obj === tower);
    for (const supporter of supporters) {
      supporter.unitOrderTrait.getCurrentTask()?.cancel();
    }
    return Math.min(this.game.rules.general.prism.supportMax, supporters.length);
  }

  /** 调试目标线配置。 */
  getTargetLinesConfig(): any {
    return this.targetLinesConfig;
  }
}
