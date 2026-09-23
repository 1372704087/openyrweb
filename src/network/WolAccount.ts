/**
 * WolAccount — WOL 账号信息类型（类型导出；孪生 execute 为空）。
 *
 * 由 network/WolAccount.ts.js 重写为 TS。孪生为 SystemJS 空 execute，
 * 说明原 TS 仅导出类型/接口（编译后被擦除）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：运行时无本模块导出值——与孪生一致。
 * 字段形状由 WOL 登录/账号上下文宽松标注（原名已 minify）。
 */

/** WOL 账号信息。 */
export interface WolAccount {
  /** 登录名/用户名。 */
  username?: string;
  /** 昵称（可与用户名不同）。 */
  nickname?: string;
  /** 密码（仅注册/登录请求使用，不应持久化明文）。 */
  password?: string;
  /** 电子邮箱。 */
  email?: string;
  /** 客户端 SKU/版本标识。 */
  sku?: number;
  /** 区域/语言设置。 */
  locale?: string;
  /** 其余协议字段（宽松索引，避免过度收窄）。 */
  [key: string]: unknown;
}
