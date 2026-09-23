/**
 * Mp3File — MP3 音频包装器。
 *
 * 持有一个底层 File（或 Blob），提供 asFile 将其重新包装为
 * type="audio/mp3" 的 File 对象，便于浏览器播放器/下载使用。
 *
 * 由 data/Mp3File.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export class Mp3File {
  /** 底层音频文件（File/Blob）。 */
  readonly file: File;

  constructor(file: File) {
    this.file = file;
  }

  /** 重新包装为 audio/mp3 类型的 File（保留原文件名）。 */
  asFile(): File {
    return new File([this.file], this.file.name, { type: "audio/mp3" });
  }
}
