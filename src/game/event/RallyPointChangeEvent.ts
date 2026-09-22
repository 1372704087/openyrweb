/**
 * RallyPointChangeEvent — 集结点变更事件。
 *
 * 玩家为建筑/工厂重新设置集结点时派发。
 *
 * 由 game/event/RallyPointChangeEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 孪生

export class RallyPointChangeEvent {
  /** 集结点被修改的建筑/工厂。 */
  readonly target: any;
  readonly type: number;

  constructor(target: any) {
    this.target = target;
    this.type = EventType.RallyPointChange;
  }
}
