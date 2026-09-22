/**
 * ObjectMorphEvent — 对象变形事件（恐怖机器人寄生、单位升级换模型等）。
 *
 * 由 game/event/ObjectMorphEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 孪生

export class ObjectMorphEvent {
  /** 变形前的对象。 */
  readonly from: any;
  /** 变形后的对象。 */
  readonly to: any;
  readonly type: number;

  constructor(from: any, to: any) {
    this.from = from;
    this.to = to;
    this.type = EventType.ObjectMorph;
  }
}
