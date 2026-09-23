/**
 * WolConnectOptions — WOL 连接选项类型（类型导出；孪生 execute 为空）。
 *
 * 由 network/WolConnectOptions.ts.js 重写为 TS。孪生为 SystemJS 空 execute，
 * 说明原 TS 仅导出类型/接口（编译后被擦除）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：运行时无本模块导出值——与孪生一致。
 * 字段按 WOL 连接上下文宽松标注（原名已 minify，无更多引用可反推）。
 */

/** WOL 连接选项。 */
export interface WolConnectOptions {
  /** 服务器主机名或地址。 */
  host?: string;
  /** 服务器端口。 */
  port?: number;
  /** 连接超时（毫秒）。 */
  timeoutMillis?: number;
  /** 是否使用 TLS/SSL。 */
  secure?: boolean;
  /** 客户端 SKU（版本标识）。 */
  clientSku?: string | number;
  /** 区域/语言代码。 */
  locale?: string;
  /** 其余协议字段（宽松索引，避免过度收窄）。 */
  [key: string]: unknown;
}
