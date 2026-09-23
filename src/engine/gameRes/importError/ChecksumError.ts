/**
 * ChecksumError — MIX/资源校验和不匹配错误。
 *
 * 继承 Error；构造签名 (message, file)：message 透传 super，
 * file 记录校验失败的文件名。不覆写 name（与孪生一致，运行时 name 为 "Error"）。
 *
 * 由 engine/gameRes/importError/ChecksumError.ts.js 逆向翻译为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export class ChecksumError extends Error {
  /** 校验失败的文件名。 */
  file: string;

  /**
   * @param message 错误消息（含期望/实际校验和等详情）。
   * @param file 校验失败的文件名。
   */
  constructor(message: string, file: string) {
    super(message);
    this.file = file;
  }
}
