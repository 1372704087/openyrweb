/**
 * ObjectUnspawnEvent — 对象退场事件。
 *
 * 对象离开世界但不计为"被摧毁"时派发（回收、超时空传送消失、
 * 任务结束移除等），与 ObjectDestroyEvent 相对。
 *
 * 由 game/event/ObjectUnspawnEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class ObjectUnspawnEvent {
  /** 退场的游戏对象。 */
  readonly gameObject: any;
  readonly type: number;

  constructor(gameObject: any) {
    this.gameObject = gameObject;
    this.type = EventType.ObjectUnspawn;
  }
}
