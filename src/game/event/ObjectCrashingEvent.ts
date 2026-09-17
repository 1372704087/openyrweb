/**
 * ObjectCrashingEvent — 对象开始坠落事件。
 *
 * 由 game/event/ObjectCrashingEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class ObjectCrashingEvent {
  readonly gameObject: any;
  readonly type: number;

  constructor(gameObject: any) {
    this.gameObject = gameObject;
    this.type = EventType.ObjectCrashing;
  }
}
