/**
 * ChatTypingHandler — 聊天输入态处理器。
 *
 * 进入输入态时暂停键盘与箭头滚屏，并置 messageList.isComposing；
 * Enter/Backspace 可在未输入时启动输入（Backspace 预设团队收件人）。
 *
 * 由 gui/screen/game/ChatTypingHandler.ts.js 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ChatMessageModule from "network/chat/ChatMessage"; // 孪生
import * as gservConfigModule from "network/gservConfig"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const ChatRecipientType: any = (ChatMessageModule as any).ChatRecipientType;
const RECIPIENT_TEAM: any = (gservConfigModule as any).RECIPIENT_TEAM;

/**
 * 聊天输入态处理器。
 * 负责在输入期间暂停世界交互键位，并维护 composing 标志。
 */
export class ChatTypingHandler {
  /** 键盘处理器。 */
  keyboardHandler: any;
  /** 箭头滚屏处理器。 */
  arrowScrollHandler: any;
  /** 消息列表视图模型。 */
  messageList: any;
  /** 聊天历史。 */
  chatHistory: any;
  /** 是否正在输入。 */
  isTyping = false;

  /**
   * @param keyboardHandler 键盘处理器
   * @param arrowScrollHandler 箭头滚屏处理器
   * @param messageList 消息列表
   * @param chatHistory 聊天历史
   */
  constructor(
    keyboardHandler: any,
    arrowScrollHandler: any,
    messageList: any,
    chatHistory: any,
  ) {
    this.keyboardHandler = keyboardHandler;
    this.arrowScrollHandler = arrowScrollHandler;
    this.messageList = messageList;
    this.chatHistory = chatHistory;
    this.isTyping = false;
  }

  /** 进入输入态：暂停键盘/滚屏并置 isComposing。 */
  startTyping(): void {
    if (!this.isTyping) {
      this.keyboardHandler.pause();
      this.arrowScrollHandler.pause();
      this.messageList.isComposing = true;
      this.isTyping = true;
    }
  }

  /** 退出输入态：恢复键盘/滚屏并清 isComposing。 */
  endTyping(): void {
    if (this.isTyping) {
      this.keyboardHandler.unpause();
      this.arrowScrollHandler.unpause();
      this.messageList.isComposing = false;
      this.isTyping = false;
    }
  }

  /**
   * 未输入时：Enter 启动输入；Backspace 预设团队收件人后启动输入。
   * @param e 键盘事件
   */
  handleKeyDown(e: KeyboardEvent): void {
    if (this.isTyping) return;
    if (e.key === "Enter") {
      this.startTyping();
    } else if (e.key === "Backspace") {
      this.chatHistory.lastComposeTarget.value = {
        type: ChatRecipientType.Channel,
        name: RECIPIENT_TEAM,
      };
      this.startTyping();
    }
  }

  /** 抬起键未处理（与孪生一致）。 */
  handleKeyUp(_e: KeyboardEvent): void {
    // 与孪生一致：空实现
  }

  /** 释放时恢复键盘/滚屏并清 composing。 */
  dispose(): void {
    this.keyboardHandler.unpause();
    this.arrowScrollHandler.unpause();
    this.messageList.isComposing = false;
  }
}
