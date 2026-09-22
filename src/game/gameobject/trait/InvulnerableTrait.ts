/**
 * InvulnerableTrait — 无敌（铁幕 Force Shield）计时 trait。
 *
 * 主 timer 管无敌窗口；fsTimer 独立计 Force Shield 过期（不受铁幕重置）。
 * isForceShield 记录当前无敌是否来自 Force Shield（染色渲染用）。
 * _version / _fsVersion 每次 apply 递增，供渲染层检测重复施加。
 *
 * 由 game/gameobject/trait/InvulnerableTrait.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Timer } from "game/gameobject/unit/Timer"; // 未转换（any-shim）
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class InvulnerableTrait {
  /** 主无敌计时器（铁幕/通用无敌）。 */
  timer: Timer;
  /** 当前无敌是否来自 Force Shield（用于视觉染色）。 */
  isForceShield: boolean;
  /** Force Shield 独立过期计时（不被铁幕重置）。 */
  fsTimer: Timer;
  /** 主无敌版本计数，每次 apply 递增。 */
  _version: number;
  /** Force Shield 版本计数，每次 apply 递增。 */
  _fsVersion: number;

  constructor() {
    this.timer = new Timer();
    // tracks whether invulnerability came from Force Shield (for visual tint).
    this.isForceShield = !1;
    // independent timer for Force Shield expiration (not reset by Iron Curtain).
    this.fsTimer = new Timer();
    // version counters increment on each apply — lets renderer detect re-applies.
    this._version = 0;
    this._fsVersion = 0;
  }

  /** 主无敌是否激活。 */
  isActive(): boolean {
    return this.timer.isActive();
  }

  /** Force Shield 是否仍激活。 */
  isForceShieldActive(): boolean {
    return this.fsTimer.isActive();
  }

  /** 施加通用无敌若干 tick（并清除 FS 来源标志）。 */
  setActiveFor(ticks: number, fromForceShield?: boolean): void {
    this.timer.setActiveFor(ticks, fromForceShield);
    this.isForceShield = !1;
    this._version++;
  }

  /** 施加 Force Shield 无敌若干 tick。 */
  setForceShieldActiveFor(ticks: number, fromForceShield?: boolean): void {
    this.fsTimer.setActiveFor(ticks, fromForceShield);
    this._fsVersion++;
  }

  /** 每 tick 推进主/FS 两个计时器。 */
  [NotifyTickModule.NotifyTick.onTick](_obj: any, world: any): void {
    this.timer.tick(world.currentTick);
    this.fsTimer.tick(world.currentTick);
  }
}
