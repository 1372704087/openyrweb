/**
 * TriggerTextEvent — 触发器文字提示（字幕/消息）事件。
 *
 * 由 game/event/TriggerTextEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType";

export class TriggerTextEvent {
  /** 要显示的文字标签/文本。 */
  readonly label: any;
  readonly type: number;

  constructor(label: any) {
    this.label = label;
    this.type = EventType.TriggerText;
  }
}
