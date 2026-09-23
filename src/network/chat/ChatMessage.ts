/**
 * ChatMessage — 聊天收件人类型枚举 ChatRecipientType。
 *
 * 由 network/chat/ChatMessage.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：仅导出数值枚举 0/1/2，与孪生逐项一致。
 * WolConnection.privmsg / handlePrivMsg / handleIrcError 等按此构造 to 字段。
 */

/** 聊天消息收件人类型。 */
export enum ChatRecipientType {
  /** 频道消息（公开聊天）。 */
  Channel = 0,
  /** 页消息（Page / 系统寻呼）。 */
  Page = 1,
  /** 私聊（Whisper）。 */
  Whisper = 2,
}
