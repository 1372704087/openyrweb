/**
 * ReplayStorageError — 回放存储错误。
 *
 * 由 gui/replay/ReplayStorageError.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 构造可选 options.cause（ES2022 Error 语义）；lib 目标下用 any 转发。
 */

/** 存储层错误。 */
export class ReplayStorageError extends Error {
  /**
   * @param message - 错误文案
   * @param options - 可选 `{ cause }`
   */
  constructor(message?: string, options?: { cause?: unknown }) {
    super(message);
    if (options && "cause" in options) {
      (this as any).cause = options.cause;
    }
  }
}
