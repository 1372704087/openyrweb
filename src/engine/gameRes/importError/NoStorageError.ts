/**
 * NoStorageError — 无可用存储适配器错误（OPFS/IndexedDB/Cache 均不可用）。
 *
 * 继承 Error 的空子类（孪生无自定义构造/字段），message/options
 * 由调用方传入 super（常见为 "No available FS adapters." 等）。
 * 不覆写 name（与孪生一致，运行时 name 为 "Error"）。
 *
 * 由 engine/gameRes/importError/NoStorageError.ts.js 逆向翻译为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export class NoStorageError extends Error {
  /**
   * @param message 错误消息（可选，与孪生 `class extends Error {}` 一致）。
   * @param options 可选 Error 构造选项（cause 等）。
   */
  constructor(message?: string, options?: { cause?: unknown }) {
    super(message);
    if (options !== null && options !== undefined && typeof options === "object" && "cause" in options) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }
}
