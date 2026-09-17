/**
 * PowerLowEvent — 进入低电力状态事件（电力 < 消耗，或黑屏生效）。
 *
 * 由 game/event/PowerLowEvent.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class PowerLowEvent {
  /** 触发事件的玩家。 */
  readonly target: any;
  readonly type: number;

  constructor(target: any) {
    this.target = target;
    this.type = EventType.PowerLow;
  }
}
