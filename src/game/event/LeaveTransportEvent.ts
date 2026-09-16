/**
 * LeaveTransportEvent — 单位离开运输车事件。
 *
 * 由 game/event/LeaveTransportEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class LeaveTransportEvent {
  /** 运输车对象。 */
  readonly target: any;
  readonly type: number = EventType.LeaveTransport;

  constructor(target: any) {
    this.target = target;
  }
}
