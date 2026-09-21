/**
 * AttackMoveTargetTask — 攻击移动到指定目标的任务（A 键点单位/建筑）。
 *
 * 继承 AttackTask：把"攻击移动"实现为对初始目标的攻击任务，并在
 * 过程中允许临时接敌：
 *  - 标记 isAttackMove = true；
 *  - 构造时缓存 initialTarget / initialWeapon，目标必须是 techno；
 *  - requestTargetUpdate / onTargetChange 维护 requestedTarget 与
 *    initialTarget 的分离：外部换目标时记录攻击是否已发生过；
 *  - onTick：移动中累计 passedFirstWaypoint；默认武器就绪时扫描，
 *    扫到且无冷却 → holdGround + passive + setWeapon 后请求换目标；
 *    attackPerformed 且单位仍在场 → 重置并回到 initialTarget/initialWeapon；
 *    单位已离场 → forceCancel；父类 onTick 完成后若目标已偏离
 *    initialTarget，标记 attackPerformed 并按取消/禁用决定完成与否。
 *
 * 由 game/gameobject/task/move/AttackMoveTargetTask.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标。
 */
import { AttackTask } from "game/gameobject/task/AttackTask"; // 已转换
import { MoveState } from "game/gameobject/trait/MoveTrait"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class AttackMoveTargetTask extends AttackTask {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  /** 本轮是否已对非初始目标开过火（用于接敌后重置）。 */
  attackPerformed: boolean;
  /** 是否已走过第一个移动途经点（接敌门槛）。 */
  passedFirstWaypoint: boolean;
  /** 内部 requestTargetUpdate 标志（扫描接敌时置位，消费后清零）。 */
  internalTargetUpdateRequested: boolean;
  /** 扫索敌冷却（normalTargetingDelay），避免每 tick 扫。 */
  scanCooldownTicks: number;
  /** 构造时传入的初始攻击目标。 */
  initialTarget: any;
  /** 构造时传入的初始武器。 */
  initialWeapon: any;
  /** 最近一次外部/内部请求的目标（可能已偏离 initialTarget）。 */
  requestedTarget: any;
  /** 上次扫描时单位所在 tile（同格且冷却中则跳过扫描）。 */
  lastScanTile: any;

  constructor(game: any, target: any, weapon: any) {
    super(game, target, weapon);
    this.isAttackMove = true;
    this.attackPerformed = false;
    this.passedFirstWaypoint = false;
    this.internalTargetUpdateRequested = false;
    this.scanCooldownTicks = 0;
    if (!target.obj?.isTechno()) throw new Error("Target must be a techno object");
    this.initialTarget = target;
    this.initialWeapon = weapon;
    this.requestedTarget = target;
  }

  /** 复制任务：用缓存的 initialTarget / initialWeapon 重建。 */
  duplicate(): AttackMoveTargetTask {
    return new AttackMoveTargetTask(this.game, this.initialTarget, this.initialWeapon);
  }

  /**
   * 请求换目标：
   *  - 内部标志置位时：直接采纳 requestedTarget 并清标志（扫描接敌路径）；
   *  - 否则：requestedTarget 仍是 initialTarget → 同步换掉；若已偏离
   *    （接过敌）→ 标记 attackPerformed，再更新 initialTarget；
   *  - 两种分支都继续调父类 requestTargetUpdate。
   */
  requestTargetUpdate(target: any): void {
    if (this.internalTargetUpdateRequested) {
      this.requestedTarget = target;
      this.internalTargetUpdateRequested = false;
    } else {
      if (this.requestedTarget === this.initialTarget) {
        this.requestedTarget = target;
      } else {
        this.attackPerformed = true;
      }
      this.initialTarget = target;
    }
    super.requestTargetUpdate(target);
  }

  /**
   * 目标切换生效后同步缓存：当前目标的 obj 与 initial/requested 都不同时，
   * 仅当 requested 尚等于 initial 时才同步 requested，随后总是更新 initial。
   */
  onTargetChange(object: any): void {
    super.onTargetChange(object);
    const current = object.attackTrait.currentTarget;
    if (
      current &&
      current.obj !== this.initialTarget.obj &&
      current.obj !== this.requestedTarget.obj
    ) {
      if (this.requestedTarget === this.initialTarget) this.requestedTarget = current;
      this.initialTarget = current;
    }
  }

  /**
   * 每 tick：移动中标记已过首途经点；递减扫描冷却；在攻击特性可用、
   * 未取消且目标条件满足时索敌/重置；最后交父类驱动，并处理
   * "父类已完成但目标已偏离 initialTarget" 的收尾分支。
   */
  onTick(object: any): boolean {
    if (object.moveTrait.moveState === MoveState.Moving) this.passedFirstWaypoint = true;
    this.scanCooldownTicks = Math.max(0, this.scanCooldownTicks - 1);
    if (
      object.attackTrait &&
      !object.attackTrait.isDisabled() &&
      !this.isCancelling() &&
      (this.requestedTarget === this.initialTarget || this.attackPerformed)
    ) {
      if (!(object.moveTrait.isIdle() || (object.tile === this.lastScanTile && this.scanCooldownTicks))) {
        this.lastScanTile = object.tile;
        this.scanCooldownTicks = this.game.rules.general.normalTargetingDelay;
        const defaultWeapon = object.attackTrait.selectDefaultWeapon(object);
        if (defaultWeapon && (this.passedFirstWaypoint || !defaultWeapon.getCooldownTicks())) {
          const scan = object.attackTrait.scanForTarget(object, defaultWeapon, this.game);
          if (scan.target) {
            const { target: scannedTarget, weapon: scannedWeapon } = scan;
            if (!scannedWeapon.getCooldownTicks()) {
              this.options.holdGround = true;
              this.options.passive = true;
              this.setWeapon(scannedWeapon);
              const newTarget = this.game.createTarget(scannedTarget, scannedTarget.tile);
              this.internalTargetUpdateRequested = true;
              this.requestTargetUpdate(newTarget);
              this.attackPerformed = false;
              return false;
            }
          }
        }
      }
      if (this.attackPerformed) {
        if (!object.isSpawned) {
          if (!this.forceCancel(object)) throw new Error("Force cancel failed");
          return true;
        }
        this.attackPerformed = false;
        this.passedFirstWaypoint = false;
        this.options.holdGround = false;
        this.options.passive = false;
        this.setWeapon(this.initialWeapon);
        this.internalTargetUpdateRequested = true;
        this.requestTargetUpdate(this.initialTarget);
      }
    }
    const done = super.onTick(object);
    return done && this.requestedTarget !== this.initialTarget
      ? ((this.attackPerformed = true), this.isCancelling() || object.attackTrait.isDisabled())
      : done;
  }
}
