/**
 * WarpedOutTrait — 超时空传送状态（remainingTicks / invulnerable，双路 NotifyWarpChange）。
 *
 * setActive(∞ 或 0) / setTimed(n) / expire 设置 remainingTicks 并经
 * notifyChange 同时广播世界 traits 与对象 traits 的 NotifyWarpChange。
 * isInvulnerable = isActive && invulnerable；tick 递减到 0 再广播一次
 * 关闭通知。
 *
 * 由 game/gameobject/trait/WarpedOutTrait.ts.js 重写为 TS（行为完全一
 * 致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as ObjectNotifyWarpChangeModule from "game/gameobject/trait/interface/NotifyWarpChange"; // 已转换
import * as WorldNotifyWarpChangeModule from "game/trait/interface/NotifyWarpChange"; // 已转换
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class WarpedOutTrait {
  /** 所属对象。 */
  gameObject: any;
  /** 是否按 tick 计时（true=无限时，false=立即失效语义由 remaining 表达）。 */
  ticksWhenWarpedOut: any;
  /** 剩余 tick（Infinity 表示持续激活）。 */
  remainingTicks: number;
  /** 激活期间是否无敌。 */
  invulnerable: boolean;

  constructor(gameObject: any) {
    this.gameObject = gameObject;
    this.ticksWhenWarpedOut = true;
    this.remainingTicks = 0;
    this.invulnerable = false;
  }

  /** 是否仍在传送态。 */
  isActive() {
    return this.remainingTicks > 0;
  }

  /**
   * 激活/关闭（无时长限制）。
   * @param active true=∞ tick，false=0
   * @param invulnerable 是否无敌
   * @param world 用于广播
   */
  setActive(active: any, invulnerable: any, world: any) {
    this.remainingTicks = active ? Number.POSITIVE_INFINITY : 0;
    this.invulnerable = invulnerable;
    this.notifyChange(active, world);
  }

  /**
   * 限时激活。
   * @param ticks 持续 tick 数
   * @param invulnerable 是否无敌
   * @param world 用于广播
   */
  setTimed(ticks: any, invulnerable: any, world: any) {
    this.remainingTicks = ticks;
    this.invulnerable = invulnerable;
    this.notifyChange(true, world);
  }

  /** 调试：直接设激活/关闭（不广播）。 */
  debugSetActive(active: any) {
    this.remainingTicks = active ? Number.POSITIVE_INFINITY : 0;
  }

  /** 双路广播 NotifyWarpChange（世界 traits + 对象 traits）。 */
  notifyChange(active: any, world: any) {
    world.traits.filter(WorldNotifyWarpChangeModule.NotifyWarpChange).forEach((trait: any) => {
      trait[WorldNotifyWarpChangeModule.NotifyWarpChange.onChange](this.gameObject, world, active);
    });
    this.gameObject.traits.filter(ObjectNotifyWarpChangeModule.NotifyWarpChange).forEach((trait: any) => {
      trait[ObjectNotifyWarpChangeModule.NotifyWarpChange.onChange](this.gameObject, world, active);
    });
  }

  /** 立即失效并广播关闭。 */
  expire(world: any) {
    this.remainingTicks = 0;
    this.notifyChange(false, world);
  }

  /** 是否激活且无敌。 */
  isInvulnerable() {
    return this.isActive() && this.invulnerable;
  }

  /** 每 tick 递减；归零时广播关闭。 */
  [NotifyTickModule.NotifyTick.onTick](_obj: any, world: any) {
    if (this.remainingTicks > 0) {
      this.remainingTicks--;
      if (this.remainingTicks <= 0) this.notifyChange(false, world);
    }
  }

  /** 释放对象引用。 */
  dispose() {
    this.gameObject = undefined;
  }
}
