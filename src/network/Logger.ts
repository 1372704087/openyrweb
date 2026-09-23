/**
 * Logger — 网络层日志器接口（类型导出；孪生 execute 为空）。
 *
 * 由 network/Logger.ts.js 重写为 TS。孪生为 SystemJS 空 execute，
 * 说明原 TS 仅导出类型/接口（编译后被擦除）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 字段/方法依据孪生调用方（WolConnection.logger.info/warn 等）反推，
 * 运行时无本模块导出值——与孪生一致。
 */

/** 网络层使用的日志器最小接口。 */
export interface Logger {
  /** 记录 info 级日志。 */
  info(message: string, ...rest: unknown[]): void;
  /** 记录 warn 级日志。 */
  warn(message: string, ...rest: unknown[]): void;
  /** 记录 error 级日志。 */
  error(message: string, ...rest: unknown[]): void;
  /** 记录 debug 级日志（可选，视实现而定）。 */
  debug?(message: string, ...rest: unknown[]): void;
}
