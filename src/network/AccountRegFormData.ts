/**
 * AccountRegFormData — 账号注册表单数据类型（类型导出；孪生 execute 为空）。
 *
 * 由 network/AccountRegFormData.ts.js 重写为 TS。孪生为 SystemJS 空 execute，
 * 说明原 TS 仅导出类型/接口（编译后被擦除）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：运行时无本模块导出值——与孪生一致。
 * 字段形状由调用方/协议上下文宽松标注（原名已 minify）。
 */

/** 账号注册表单载荷。 */
export interface AccountRegFormData {
  /** 用户名。 */
  username?: string;
  /** 密码。 */
  password?: string;
  /** 电子邮箱。 */
  email?: string;
  /** 其余协议字段（宽松索引，避免过度收窄）。 */
  [key: string]: unknown;
}
