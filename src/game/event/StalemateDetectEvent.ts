/**
 * StalemateDetectEvent — 僵局（平局）检测事件。
 *
 * 由 game/event/StalemateDetectEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class StalemateDetectEvent {
  readonly type: number;

  constructor() {
    this.type = EventType.StalemateDetect;
  }
}
