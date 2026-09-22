/**
 * CheerEvent — 欢呼事件。
 *
 * 单位/建筑被下达欢呼指令时派发，用于播放欢呼动画与音效。
 *
 * 由 game/event/CheerEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class CheerEvent {
  /** 下达欢呼的玩家。 */
  readonly player: any;
  readonly type: number;

  constructor(player: any) {
    this.player = player;
    this.type = EventType.Cheer;
  }
}
