/**
 * MindControllerTrait — 心灵控制 trait（尤里复制人/X/主脑）。
 *
 * maxCapacity 为安全上限；overloadEnabled（主脑）无硬上限但超编时
 * 按 overloadDamage/Frames 表自伤（“脑过载”），HP 归零 destroyObject
 * 后经 NotifyUnspawn 恢复全部被控目标。常规 cap-1 控制者换控时释放
 * 最旧目标。控制者 unspawn / 超时空 / 无敌时全部释放。
 *
 * 由 game/gameobject/trait/MindControllerTrait.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as NotifyUnspawnModule from "game/gameobject/trait/interface/NotifyUnspawn"; // 已转换
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换
import { GameSpeed } from "game/GameSpeed"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class MindControllerTrait {
  /** 宿主控制者。 */
  gameObject: any;
  /** 安全控制上限（超编可由 overload 叠加）。 */
  maxCapacity: number;
  /** 是否启用脑过载（INI MindControlOverload）。 */
  overloadEnabled: boolean;
  /** 当前被控目标列表。 */
  targets: any[];
  /** 过载自伤累积帧（距上次自伤的 tick）。 */
  _overloadTicks: number;

  constructor(gameObject: any, maxCapacity = 1, overloadEnabled = false) {
    this.gameObject = gameObject;
    this.maxCapacity = maxCapacity;
    this.overloadEnabled = !!overloadEnabled;
    this.targets = [];
    // overload accumulator (frames since last self-damage tick)
    this._overloadTicks = 0;
  }

  /** 是否有被控目标。 */
  isActive(): boolean {
    return 0 < this.targets.length;
  }

  /** 是否已达安全上限（过载控制者恒 false，可超编）。 */
  isAtCapacity(): boolean {
    // overload-enabled controllers (Mastermind) have no hard cap;
    // they can always acquire more targets beyond maxCapacity (but take self-damage).
    if (this.overloadEnabled) return !1;
    return this.targets.length >= this.maxCapacity;
  }

  /** 被控目标快照。 */
  getTargets(): any[] {
    return this.targets;
  }

  /** 控制目标；超编时常规控制者释放最旧目标。 */
  control(target: any, world: any): void {
    if (!this.gameObject) throw new Error("Trait already disposed");
    if (!target.mindControllableTrait) throw new Error(`Target "${target.name}" cannot be mind controlled`);
    if (target.isDisposed) throw new Error(`Target "${target.name}" is disposed`);
    // overload-enabled controllers (Mastermind) have no hard cap;
    // they can exceed maxCapacity but take self-damage via onTick.
    if (!this.overloadEnabled && this.targets.length >= this.maxCapacity) {
      // vanilla YR cap-1 controllers (Yuri Clone / Yuri X) release the
      // oldest controlled target and take the new one when ordered to switch.
      const oldest = this.targets.shift();
      if (oldest && oldest.mindControllableTrait) oldest.mindControllableTrait.restore(world);
    }
    target.mindControllableTrait.controlBy(this.gameObject, world);
    this.targets.push(target);
    // draw the mind-control attack line for MindControlAttackLineFrames
    // regardless of selection state (vanilla YR [CombatDamage]).
    const frames = world.rules.combatDamage.mindControlAttackLineFrames;
    if (frames > 0) {
      target._mindControlAttackLineEnd =
        performance.now() + (frames * 1000) / GameSpeed.BASE_TICKS_PER_SECOND;
    }
  }

  /** 从被控列表移除（不 restore）。 */
  cleanTarget(target: any): void {
    const idx = this.targets.indexOf(target);
    if (idx !== -1) this.targets.splice(idx, 1);
  }

  /**
   * 每 tick：超时空/铁幕时释放全部控制；否则按 overload 表自伤。
   * 与 cookgreen OpenRA 的 SelfHealing@Overload -5%/tick 对齐。
   */
  [NotifyTickModule.NotifyTick.onTick](_obj: any, world: any): void {
    if (!this.gameObject || this.gameObject.isDisposed || this.gameObject.isDestroyed) return;
    // Release links if the controller is chrono'd or iron-curtained.
    if (this.targets.length) {
      try {
        if (
          (this.gameObject.warpedOutTrait && this.gameObject.warpedOutTrait.isActive()) ||
          (this.gameObject.invulnerableTrait && this.gameObject.invulnerableTrait.isActive())
        ) {
          for (const target of this.targets) target.mindControllableTrait.restore(world);
          this.targets.length = 0;
          return;
        }
      } catch {
        /* ignore */
      }
    }
    if (!this.overloadEnabled) return;
    const count = this.targets.length;
    const combat = world.rules.combatDamage;
    const overloadCount = combat.overloadCount;
    let tier = 0;
    for (; tier < overloadCount.length && !(count <= overloadCount[tier]); tier++);
    if (tier >= overloadCount.length) tier = overloadCount.length - 1;
    const damage = combat.overloadDamage[tier] || 0;
    const frames = combat.overloadFrames[tier] || 1;
    if (damage <= 0) {
      this._overloadTicks = 0;
      return;
    }
    this._overloadTicks = (this._overloadTicks || 0) + 1;
    if (this._overloadTicks < frames) return;
    this._overloadTicks = 0;
    const health = this.gameObject.healthTrait;
    if (health) {
      // inflictDamage dispatches InflictDamageEvent which triggers parasite
      // white sparks (via ParasiteSparkFxHandler) and other damage visuals.
      health.inflictDamage(damage, { obj: this.gameObject }, world);
      // parasite-style rocking (Terror Drone shaking effect).
      if (typeof this.gameObject.applyRocking === "function") {
        this.gameObject.applyRocking(90 * (world.generateRandom() < 0.5 ? 1 : -1), 1);
      }
      if (health.getHitPoints() <= 0 && !this.gameObject.isDestroyed) {
        // destroyObject(undefined attacker) skips score bookkeeping (!i branch).
        // flag so SoundHandler can play MasterMindOverloadDeathSound.
        this.gameObject._mindOverloadDeath = !0;
        world.destroyObject(this.gameObject, void 0);
      }
    }
  }

  /** 离场：恢复全部被控目标。 */
  [NotifyUnspawnModule.NotifyUnspawn.onUnspawn](_obj: any, world: any): void {
    for (const target of this.targets) target.mindControllableTrait.restore(world);
    this.targets.length = 0;
  }

  /** 释放宿主引用。 */
  dispose(): void {
    this.gameObject = void 0;
  }
}
