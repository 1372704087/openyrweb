/**
 * ImageContext — 图像加载上下文（imageUrlCache + vfs/cdnBaseUrl 挂载点）。
 *
 * 由 gui/component/ImageContext.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 图像上下文（静态挂载点，由应用注入）。 */
export class ImageContext {
  /** src → objectURL/dataURL 缓存。 */
  static imageUrlCache = new Map<string, string>();
  /** VFS 句柄（可选，应用注入）。 */
  static vfs?: any;
  /** CDN 基址（可选）。 */
  static cdnBaseUrl?: string;
}
