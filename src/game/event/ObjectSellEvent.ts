/**
 * ObjectSellEvent — 对象被出售（变卖）事件。
 *
 * 由 game/event/ObjectSellEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class ObjectSellEvent {
  /** 被出售的目标对象。 */
  readonly target: any;
  readonly type: number;

  constructor(target: any) {
    this.target = target;
    this.type = EventType.ObjectSell;
  }
}
