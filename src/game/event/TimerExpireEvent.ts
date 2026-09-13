/**
 * TimerExpireEvent — 倒计时到期事件。
 *
 * 由 game/event/TimerExpireEvent.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的
 * 编译产物。
 */
import { EventType } from "game/event/EventType";

export class TimerExpireEvent {
  /** 触发该事件的对象（当前只有 CountdownTimer）。 */
  readonly target: any;
  readonly type: EventType = EventType.TimerExpire;

  constructor(target: any) {
    this.target = target;
  }
}
