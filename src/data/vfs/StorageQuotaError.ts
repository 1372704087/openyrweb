/**
 * StorageQuotaError — 浏览器/配额存储空间超限错误。
 *
 * 固定 message 为 "Storage quota exceeded"；孪生以 super(msg, options)
 * 透传第二参（ES2022 Error 读取 options.cause）。ES2020 lib 下 Error
 * 仅 1 参，此处手动复刻 cause 挂载，运行时与孪生一致。
 * name 固定为 "StorageQuotaError"。
 *
 * 由 data/vfs/StorageQuotaError.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export class StorageQuotaError extends Error {
  constructor(options?: unknown) {
    super("Storage quota exceeded");
    // 与 super(msg, options) 一致：仅当 options 是对象且含 cause 时挂载
    if (options !== null && options !== undefined && typeof options === "object" && "cause" in (options as object)) {
      (this as { cause?: unknown }).cause = (options as { cause?: unknown }).cause;
    }
    this.name = "StorageQuotaError";
  }
}
