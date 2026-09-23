/**
 * Message — 聊天消息结构类型（类型导出；孪生 execute 为空）。
 *
 * 由 network/chat/Message.ts.js 重写为 TS。孪生为 SystemJS 空 execute，
 * 说明原 TS 仅导出类型/接口（编译后被擦除）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：运行时无本模块导出值——与孪生一致。
 * 字段形状由 GservConnection.handlePrivMsg / WolConnection 写入的
 * { from, to, text, time } 对象反推；to 使用 chat/ChatMessage 的
 * ChatRecipientType。
 */

import { ChatRecipientType } from "network/chat/ChatMessage"; // 孪生

/** 聊天收件人（频道/页/私聊目标）。 */
export interface ChatRecipient {
  /** 收件人类型。 */
  type: ChatRecipientType;
  /** 收件人名称（频道名或用户名）。 */
  name: string;
}

/** 一条聊天消息。 */
export interface Message {
  /** 发送者用户名。 */
  from: string;
  /** 收件人。 */
  to: ChatRecipient;
  /** 消息正文。 */
  text: string;
  /** 发送时间。 */
  time: Date;
}
