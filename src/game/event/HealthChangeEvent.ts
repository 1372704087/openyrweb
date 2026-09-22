/**
 * HealthChangeEvent — 生命值变化事件。
 *
 * 对象 HP 发生任意变化（受击、维修、中毒、回血等）时派发，
 * HUD 血条与相关特效据此刷新。
 *
 * 由 game/event/HealthChangeEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class HealthChangeEvent {
  /** 生命值变化的对象。 */
  readonly target: any;
  /** 变化后的当前生命值。 */
  readonly currentHealth: number;
  /** 变化前的生命值。 */
  readonly prevHealth: number;
  readonly type: number;

  constructor(target: any, currentHealth: number, prevHealth: number) {
    this.target = target;
    this.currentHealth = currentHealth;
    this.prevHealth = prevHealth;
    this.type = EventType.HealthChange;
  }
}
