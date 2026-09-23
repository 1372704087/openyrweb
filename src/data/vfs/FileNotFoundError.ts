/**
 * FileNotFoundError — VFS/真实文件系统中“目标文件不存在”错误。
 *
 * 继承 Error，固定 name 为 "FileNotFoundError"；message 由 super 透传。
 * 调用方通过 instanceof 判定并决定是否继续回退查找。
 *
 * 由 data/vfs/FileNotFoundError.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 */
export class FileNotFoundError extends Error {
  /** 透传的 cause（ES2022 之外手动挂载）。 */
  cause?: unknown;

  constructor(message?: string, options?: { cause?: unknown }) {
    super(message);
    if (options && options.cause !== undefined) this.cause = options.cause;
    this.name = "FileNotFoundError";
  }
}
