/**
 * MessageList — HUD 消息视图模型（时间衰减 + 容量裁剪）。
 *
 * 由 gui/screen/game/component/hud/viewmodel/MessageList.ts.js
 * 重写为 TS（行为完全一致）。
 */
import { EventDispatcher } from "util/event"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 消息列表 VM。 */
export class MessageList {
  /** 默认存活秒。 */
  messageDurationSeconds: number;
  /** 最大保留条数。 */
  maxMessages: number;
  /** 本地玩家（取色）。 */
  localPlayer: any;
  /** 是否输入中。 */
  isComposing = false;
  /** 消息数组。 */
  messages: any[] = [];
  /** 新消息事件源。 */
  private _onNewMessage = new EventDispatcher();

  /** 新消息事件。 */
  get onNewMessage() {
    return this._onNewMessage.asEvent();
  }

  /**
   * @param messageDurationSeconds 存活秒
   * @param maxMessages 容量
   * @param localPlayer 本地玩家
   */
  constructor(messageDurationSeconds: number, maxMessages: number, localPlayer: any) {
    this.messageDurationSeconds = messageDurationSeconds;
    this.maxMessages = maxMessages;
    this.localPlayer = localPlayer;
    this.isComposing = false;
    this.messages = [];
    this._onNewMessage = new EventDispatcher();
  }

  /**
   * UI 反馈（不动画）。
   * @param text 文本
   */
  addUiFeedbackMessage(text: string): void {
    const msg = {
      text,
      color: this.localPlayer?.color.asHexString() ?? "grey",
      time: Date.now(),
      animate: false,
    };
    this.messages.push(msg);
    this._onNewMessage.dispatch(this, msg);
  }

  /**
   * 系统消息（可传色对象）。
   * @param text 文本
   * @param color 色字符串或对象
   * @param durationSeconds 可选存活秒
   */
  addSystemMessage(text: string, color: any, durationSeconds?: number): void {
    const msg = {
      text,
      color: typeof color === "string" ? color : color.color.asHexString(),
      time: Date.now(),
      animate: true,
      durationSeconds,
    };
    this.messages.push(msg);
    this._onNewMessage.dispatch(this, msg);
  }

  /**
   * 聊天消息。
   * @param text 文本
   * @param color 色
   */
  addChatMessage(text: string, color: string): void {
    const msg = { text, color, time: Date.now(), animate: true };
    this.messages.push(msg);
    this._onNewMessage.dispatch(this, msg);
  }

  /** 过期清理并裁到容量。 */
  prune(): void {
    const now = Date.now();
    this.messages = this.messages.filter(
      (m) => m.time >= now - 1e3 * (m.durationSeconds ?? this.messageDurationSeconds),
    );
    this.messages.splice(0, this.messages.length - this.maxMessages);
  }

  /** 取全部消息。 */
  getAll(): any[] {
    return this.messages;
  }
}
