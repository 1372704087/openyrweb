/**
 * SystemMessage — 系统消息类型（类型导出；孪生 execute 为空）。
 *
 * 由 network/chat/SystemMessage.ts.js 重写为 TS。孪生为 SystemJS 空 execute，
 * 说明原 TS 仅导出类型/接口（编译后被擦除）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：运行时无本模块导出值——与孪生一致。
 * 字段按聊天/系统提示上下文宽松标注（原名已 minify）。
 */

/** 系统消息载荷（本地 UI 系统提示，非 IRC PRIVMSG）。 */
export interface SystemMessage {
  /** 消息正文。 */
  text?: string;
  /** 可选的本地化键（UI 先查 key 再回退 text）。 */
  key?: string;
  /** 其余协议字段（宽松索引，避免过度收窄）。 */
  [key: string]: unknown;
}
