/**
 * ObjectOwnerChangeEvent — 对象归属玩家变化事件。
 *
 * 对象易主（占领建筑、精神控制、载具乘员变更等）时派发，
 * 供阵营配色、AI 与 UI 刷新归属。
 *
 * 由 game/event/ObjectOwnerChangeEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class ObjectOwnerChangeEvent {
  /** 归属发生变化的对象。 */
  readonly target: any;
  /** 变化前的归属玩家。 */
  readonly prevOwner: any;
  readonly type: number;

  constructor(target: any, prevOwner: any) {
    this.target = target;
    this.prevOwner = prevOwner;
    this.type = EventType.ObjectOwnerChange;
  }
}
