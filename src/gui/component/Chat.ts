/**
 * Chat — 聊天面板（消息列表 + ChatInput + 发送按钮，自动滚到底）。
 *
 * componentDidUpdate 在列表增长且接近底部时贴底；renderMessage 格式化前缀与正文。
 *
 * 由 gui/component/Chat.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生（第三方）
import * as ClassnamesModule from "classnames"; // 孪生（第三方）
import { ChatRecipientType } from "network/chat/ChatMessage"; // 已转换
import { ChatMessageFormat } from "gui/chat/ChatMessageFormat"; // 孪生（本批内一并转换）
import { ChatInput } from "gui/component/ChatInput"; // 孪生（本批内一并转换）

// 孪生 any-shim：第三方 CJS 取 default
const React: any = (ReactModule as any).default;
const classnames: any = (ClassnamesModule as any).default ?? ClassnamesModule;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 收件类型 → CSS 类。 */
const TYPE_CLASS = new Map<number, string>()
  .set(ChatRecipientType.Channel, "type-channel")
  .set(ChatRecipientType.Page, "type-page")
  .set(ChatRecipientType.Whisper, "type-whisper");

/** 聊天面板。 */
export class Chat extends (React.Component as any) {
  constructor(props: any) {
    super(props);
    this.prevMessageCount = 0;
  }

  /** 消息列表 DOM。 */
  messageList?: any;
  /** ChatInput ref。 */
  textBox?: any;
  /** 上次消息数。 */
  prevMessageCount: number;
  /** 上次最早消息。 */
  prevOldestMessage?: any;
  /** 上次 scrollHeight。 */
  prevScrollHeight?: number;

  /** 渲染列表 + 输入区。 */
  render(): any {
    const { messages, tooltips, strings, chatHistory, channels } = this.props;
    return React.createElement(
      "div",
      { className: "chat-wrapper" },
      React.createElement(
        "div",
        {
          className: "messages",
          ref: (el: any) => (this.messageList = el),
          "data-r-tooltip": tooltips?.output,
        },
        messages.map((msg: any, i: number) => this.renderMessage(msg, i)),
      ),
      React.createElement(
        "div",
        { className: "new-message-wrapper" },
        React.createElement(ChatInput, {
          ref: (el: any) => (this.textBox = el),
          chatHistory,
          channels,
          className: "new-message",
          tooltip: tooltips?.input,
          strings,
          onSubmit: this.props.onSendMessage,
          onCancel: this.props.onCancelMessage,
        }),
        React.createElement("button", {
          className: "icon-button send-message-button",
          "data-r-tooltip": tooltips?.button,
          onClick: () => this.textBox.send(),
        }),
      ),
    );
  }

  /** 消息列表变化时尽量贴底滚动。 */
  componentDidUpdate(): void {
    if (this.props.messages[0] === this.prevOldestMessage && this.props.messages.length === this.prevMessageCount) {
      return;
    }
    this.prevMessageCount = this.props.messages.length;
    this.prevOldestMessage = this.props.messages[0];
    const scrollHeight = this.messageList.scrollHeight;
    const clientHeight = this.messageList.clientHeight;
    if (
      scrollHeight !== this.prevScrollHeight &&
      (!this.prevScrollHeight || Math.abs(this.messageList.scrollTop - (this.prevScrollHeight - clientHeight)) <= 1)
    ) {
      this.messageList.scrollTop = scrollHeight - clientHeight;
    }
    this.prevScrollHeight = scrollHeight;
  }

  /**
   * 渲染单条消息。
   * @param msg - 消息
   * @param key - 列表键
   */
  renderMessage(msg: any, key: number): any {
    const format = new ChatMessageFormat(
      this.props.strings,
      this.props.localUsername,
      this.props.userColors,
    );
    const classes: any[] = ["message"];
    let prefix;
    if (msg.from !== undefined) {
      prefix = format.formatPrefixHtml(msg, (user: string) => {
        if (this.props.chatHistory && msg.to && msg.to.type !== ChatRecipientType.Page) {
          this.props.chatHistory.lastComposeTarget.value = { type: ChatRecipientType.Whisper, name: user };
        }
      });
      classes.push(TYPE_CLASS.get(msg.to.type), { "operator-message": msg.operator });
    }
    const canFormatUrls = msg.from === undefined && !msg.untrustedContent;
    const body = format.formatTextHtml(msg.text, canFormatUrls);
    return React.createElement(
      "div",
      { key, className: classnames(classes) },
      prefix
        ? React.createElement(React.Fragment, null, React.createElement("span", null, prefix), " ", body)
        : body,
    );
  }
}
