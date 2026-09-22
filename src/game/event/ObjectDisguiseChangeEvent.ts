/**
 * ObjectDisguiseChangeEvent — 对象伪装变更事件。
 *
 * 间谍/幻影坦克伪装成敌方对象，或伪装被解除时派发；Minimap 等据此
 * 刷新小地图显示。
 *
 * 由 game/event/ObjectDisguiseChangeEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 孪生

export class ObjectDisguiseChangeEvent {
  /** 伪装状态发生变化的对象。 */
  readonly target: any;
  readonly type: number;

  constructor(target: any) {
    this.target = target;
    this.type = EventType.ObjectDisguiseChange;
  }
}
