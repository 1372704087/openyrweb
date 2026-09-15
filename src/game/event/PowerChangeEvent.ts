/**
 * PowerChangeEvent — 电力数值变化事件（任意变化都派发，sidebar HUD 刷新用）。
 *
 * 由 game/event/PowerChangeEvent.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 */
import { EventType } from "game/event/EventType";

export class PowerChangeEvent {
  /** 触发事件的玩家。 */
  readonly target: any;
  /** 变化后的可用电力。 */
  readonly power: number;
  /** 当前总电力消耗。 */
  readonly drain: number;
  readonly type: number = EventType.PowerChange;

  constructor(target: any, power: number, drain: number) {
    this.target = target;
    this.power = power;
    this.drain = drain;
  }
}
