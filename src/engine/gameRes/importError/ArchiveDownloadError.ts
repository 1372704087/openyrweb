/**
 * ArchiveDownloadError — 归档 URL 下载失败错误。
 *
 * 继承 Error；构造签名 (url, message, options?)：
 * - message/options 透传给 super（options.cause 由 ES Error 或手动挂载）；
 * - url 记录失败的下载地址。
 * 不覆写 name（与孪生一致，运行时 name 为 "Error"）。
 *
 * 由 engine/gameRes/importError/ArchiveDownloadError.ts.js 逆向翻译为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export class ArchiveDownloadError extends Error {
  /** 下载失败的资源 URL。 */
  url: string;

  /**
   * @param url 失败的下载地址。
   * @param message 错误消息。
   * @param options 可选 Error 构造选项（cause 等）。
   */
  constructor(url: string, message?: string, options?: { cause?: unknown }) {
    super(message);
    // ES2020 lib 下 Error 仅 1 参：手动复刻 super(msg, options).cause 挂载
    if (options !== null && options !== undefined && typeof options === "object" && "cause" in options) {
      (this as { cause?: unknown }).cause = options.cause;
    }
    this.url = url;
  }
}
