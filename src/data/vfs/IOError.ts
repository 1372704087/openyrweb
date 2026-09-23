/**
 * IOError — VFS 读写失败的通用错误类型。
 *
 * 由 data/vfs/IOError.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 构造转发全部参数给 Error，并强制 name = "IOError"。
 */
export class IOError extends Error {
  /** 透传的 cause（ES2022 之外手动挂载）。 */
  cause?: unknown;

  constructor(message?: string | Error, options?: { cause?: unknown }) {
    super(message as any);
    if (options && options.cause !== undefined) this.cause = options.cause;
    this.name = "IOError";
  }
}
