/**
 * TriggerStopSoundFxEvent — 触发器停止音效事件。
 *
 * 地图触发器要求停止在指定格关联的循环/持续音效时派发，
 * 声音系统据此结束对应音效。
 *
 * 由 game/event/TriggerStopSoundFxEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class TriggerStopSoundFxEvent {
  /** 需要停止音效的地图格。 */
  readonly tile: any;
  readonly type: number;

  constructor(tile: any) {
    this.tile = tile;
    this.type = EventType.TriggerStopSoundFx;
  }
}
