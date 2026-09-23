/**
 * ChatHistory — 聊天消息缓冲与最近私聊/编辑目标状态。
 *
 * 持有 messages 数组、lastWhisperFrom/To、lastComposeTarget（默认频道 ALL），
 * addChatMessage 推入并派发 onNewMessage。
 *
 * 由 gui/chat/ChatHistory.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { ChatRecipientType } from "network/chat/ChatMessage"; // 已转换
import { RECIPIENT_ALL } from "network/gservConfig"; // 已转换
import { BoxedVar } from "util/BoxedVar"; // 已转换
import { EventDispatcher } from "util/event"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 聊天历史缓冲。 */
export class ChatHistory {
  /** 最近一次私聊发送方。 */
  lastWhisperFrom = new BoxedVar<any>(undefined);
  /** 最近一次私聊接收方。 */
  lastWhisperTo = new BoxedVar<any>(undefined);
  /** 当前编辑目标（默认频道 ALL）。 */
  lastComposeTarget = new BoxedVar<any>({
    type: ChatRecipientType.Channel,
    name: RECIPIENT_ALL,
  });
  /** 全部已收消息。 */
  messages: any[] = [];
  /** 新消息派发器。 */
  private _onNewMessage = new EventDispatcher();

  /** 新消息事件。 */
  get onNewMessage() {
    return this._onNewMessage.asEvent();
  }

  /**
   * 追加一条消息并通知订阅者。
   * @param message - 聊天消息
   */
  addChatMessage(message: any): void {
    this.messages.push(message);
    this._onNewMessage.dispatch(this, message);
  }

  /** 返回内部消息数组（非拷贝）。 */
  getAll(): any[] {
    return this.messages;
  }
}
