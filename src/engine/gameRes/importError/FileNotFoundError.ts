/**
 * FileNotFoundError — 游戏资源导入过程中“归档内缺少目标文件”错误。
 *
 * 继承 Error；构造仅收 file：message 固定为 `File "${file}" not found.`，
 * 并挂载 this.file。不覆写 name（与孪生一致，运行时 name 为 "Error"）。
 * 注意：与 data/vfs/FileNotFoundError 是不同类（后者覆写 name 且支持 cause）。
 *
 * 由 engine/gameRes/importError/FileNotFoundError.ts.js 逆向翻译为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export class FileNotFoundError extends Error {
  /** 缺失的文件名。 */
  file: string;

  /**
   * @param file 归档中未找到的文件名。
   */
  constructor(file: string) {
    super(`File "${file}" not found.`);
    this.file = file;
  }
}
