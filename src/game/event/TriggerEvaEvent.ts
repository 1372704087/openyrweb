/**
 * TriggerEvaEvent — 触发器 EVA 语音播报事件。
 *
 * 由 game/event/TriggerEvaEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class TriggerEvaEvent {
  /** 要播放的 EVA 音效 ID。 */
  readonly soundId: any;
  readonly type: number;

  constructor(soundId: any) {
    this.soundId = soundId;
    this.type = EventType.TriggerEva;
  }
}
