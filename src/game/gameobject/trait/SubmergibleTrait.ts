/**
 * SubmergibleTrait — 潜水/浮出 trait（潜艇等）。
 *
 * 未潜且未寄生时：攻击中冷却至少 5s，否则惰性初始化 cloakDelay 冷却；
 * 冷却归零进入潜航（targetSurfaceProgress=1）并派发 ShipSubmergeChangeEvent。
 * 受伤强制 emerge；surfaceProgress 以 1/30/tick 向目标插值。
 *
 * 由 game/gameobject/trait/SubmergibleTrait.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { ShipSubmergeChangeEvent } from "game/event/ShipSubmergeChangeEvent"; // 未转换（any-shim）
import { GameSpeed } from "game/GameSpeed"; // 已转换
import { AttackState } from "game/gameobject/trait/AttackTrait"; // 未转换（any-shim）
import * as NotifyDamageModule from "game/gameobject/trait/interface/NotifyDamage"; // 已转换
import * as NotifyTickModule from "game/gameobject/trait/interface/NotifyTick"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class SubmergibleTrait {
  /** 当前是否已潜航。 */
  isActive: boolean;
  /** 浮出动画进度 0..1（0=全浮，1=全潜）。 */
  surfaceProgress: number;
  /** 目标浮出进度。 */
  targetSurfaceProgress: number;
  /** 下潜冷却剩余 tick。 */
  cooldownTicks: number | undefined;

  constructor() {
    this.isActive = !1;
    this.surfaceProgress = 0;
    this.targetSurfaceProgress = 0;
  }

  /** 是否已潜航。 */
  isSubmerged(): boolean {
    return this.isActive;
  }

  /** 当前浮出进度。 */
  getSurfaceProgress(): number {
    return this.surfaceProgress;
  }

  /** 设置下潜冷却 tick。 */
  setCooldown(ticks: number): void {
    this.cooldownTicks = ticks;
  }

  /** 每 tick：冷却→潜航判定 + surfaceProgress 插值。 */
  [NotifyTickModule.NotifyTick.onTick](obj: any, world: any): void {
    if (!this.isActive && !obj.parasiteableTrait?.isInfested()) {
      if (obj.attackTrait && obj.attackTrait.attackState !== AttackState.Idle && !obj.moveTrait.isMoving()) {
        this.cooldownTicks = Math.max(this.cooldownTicks ?? 0, 5 * GameSpeed.BASE_TICKS_PER_SECOND);
      } else if (this.cooldownTicks == null) {
        this.cooldownTicks = Math.floor(60 * world.rules.general.cloakDelay * GameSpeed.BASE_TICKS_PER_SECOND);
      }
      if (0 < (this.cooldownTicks ?? 0)) this.cooldownTicks = (this.cooldownTicks as number) - 1;
      if ((this.cooldownTicks ?? 0) <= 0) {
        this.isActive = !0;
        this.targetSurfaceProgress = 1;
        world.events.dispatch(new ShipSubmergeChangeEvent(obj));
      }
    }
    this.updateSurfaceProgress();
  }

  /** 每帧向 targetSurfaceProgress 靠拢 1/30。 */
  updateSurfaceProgress(): void {
    const step = 1 / 30;
    if (this.surfaceProgress < this.targetSurfaceProgress) {
      this.surfaceProgress = Math.min(1, this.surfaceProgress + step);
    } else if (this.surfaceProgress > this.targetSurfaceProgress) {
      this.surfaceProgress = Math.max(0, this.surfaceProgress - step);
    }
  }

  /** 受伤强制浮出。 */
  [NotifyDamageModule.NotifyDamage.onDamage](obj: any, world: any): void {
    this.emerge(obj, world);
  }

  /** 浮出：重置冷却与目标进度并派发事件。 */
  emerge(obj: any, world: any): void {
    if (this.isActive) {
      this.isActive = !1;
      this.cooldownTicks = Math.max(this.cooldownTicks ?? 0, 5 * GameSpeed.BASE_TICKS_PER_SECOND);
      this.targetSurfaceProgress = 0;
      world.events.dispatch(new ShipSubmergeChangeEvent(obj));
    }
  }
}
