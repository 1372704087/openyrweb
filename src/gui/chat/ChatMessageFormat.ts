/**
 * ChatMessageFormat — 聊天前缀/正文的纯文本与 React 节点格式化。
 *
 * 按收件类型（频道/页/私聊）选 i18n 模板；HTML 前缀可挂用户色与点击回私聊；
 * 正文可选 ReactFormat.formatUrls 链接化。
 *
 * 由 gui/chat/ChatMessageFormat.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生（第三方）
import { ChatRecipientType } from "network/chat/ChatMessage"; // 已转换
import { RECIPIENT_TEAM } from "network/gservConfig"; // 已转换
import * as ReactFormatModule from "gui/ReactFormat"; // 孪生（本批内一并转换）

// 孪生 any-shim：第三方/未转换模块的具名导出不可用，取命名空间成员
const React: any = (ReactModule as any).default;
const ReactFormat: any = (ReactFormatModule as any).ReactFormat;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 聊天消息格式化器。 */
export class ChatMessageFormat {
  /** i18n 字符串表。 */
  strings: any;
  /** 本地用户名。 */
  localUsername: any;
  /** 用户名→颜色映射（可选）。 */
  userColors: any;

  /**
   * @param strings - i18n
   * @param localUsername - 本地用户名
   * @param userColors - 用户色表
   */
  constructor(strings: any, localUsername: any, userColors: any) {
    this.strings = strings;
    this.localUsername = localUsername;
    this.userColors = userColors;
  }

  /**
   * 纯文本前缀（发送方显示名）。
   * @param msg - 消息
   */
  formatPrefixPlain(msg: any): string {
    let result: string;
    if (msg.to.type === ChatRecipientType.Channel) {
      result =
        msg.to.name === RECIPIENT_TEAM
          ? this.strings.get("TS:ChatFromAllies", msg.from)
          : this.strings.get("TS:ChatFrom", msg.from);
    } else if (msg.to.type === ChatRecipientType.Page) {
      result = this.strings.get("TS:PageFrom", msg.from);
    } else {
      if (msg.to.type !== ChatRecipientType.Whisper) throw new Error("Unknown message type " + msg.to.type);
      result =
        msg.from === this.localUsername
          ? this.strings.get("TS:To", msg.to.name)
          : this.strings.get("TXT_FROM", msg.from);
    }
    return result;
  }

  /**
   * React 前缀节点（时间戳 + 颜色 + 可点用户名 + 模板前后缀）。
   * @param msg - 消息
   * @param onUserClick - 点击用户名回填私聊（可选）
   */
  formatPrefixHtml(msg: any, onUserClick?: (user: string) => void): any {
    const displayName =
      msg.to.type === ChatRecipientType.Whisper && msg.from === this.localUsername ? msg.to.name : msg.from;
    let nameNode: any = displayName;
    let timestamp: string;
    let userColor: string | undefined;
    const placeholder = "{user}";

    if (msg.to.type !== ChatRecipientType.Page) {
      userColor = this.userColors?.get(msg.from);
      if (userColor !== undefined) {
        nameNode = React.createElement("span", { style: { color: userColor } }, nameNode);
      }
      if (onUserClick) {
        const linkParts = this.strings.get("TS:ChatUserLink", placeholder).split(placeholder);
        nameNode = React.createElement(
          "span",
          { className: "user-link", onClick: () => onUserClick(displayName) },
          linkParts[0],
          nameNode,
          linkParts[1],
        );
      }
      timestamp =
        this.strings.get("TS:ChatTimestamp", msg.time.toLocaleTimeString(undefined, { timeStyle: "short" })) + " ";
    }

    let template: string;
    if (msg.to.type === ChatRecipientType.Channel) {
      template =
        msg.to.name === RECIPIENT_TEAM
          ? this.strings.get("TS:ChatFromAllies", placeholder)
          : this.strings.get("TS:ChatFrom", placeholder);
    } else if (msg.to.type === ChatRecipientType.Page) {
      template = this.strings.get("TS:PageFrom", placeholder);
    } else {
      if (msg.to.type !== ChatRecipientType.Whisper) throw new Error("Unknown message type " + msg.to.type);
      template =
        msg.from === this.localUsername
          ? this.strings.get("TS:To", placeholder)
          : this.strings.get("TXT_FROM", placeholder);
    }
    const [prefix, suffix] = template.split(placeholder);
    return React.createElement(React.Fragment, null, timestamp, prefix, nameNode, suffix);
  }

  /**
   * 正文：可选 URL 链接化。
   * @param text - 原文
   * @param formatUrls - 是否链接化
   */
  formatTextHtml(text: string, formatUrls: boolean): any {
    return formatUrls ? ReactFormat.formatUrls(text) : text;
  }
}
