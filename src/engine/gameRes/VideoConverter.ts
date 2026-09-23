/**
 * VideoConverter — Bink(.bik) → WebM/MP4 转码封装。
 *
 * 依赖外部 ffmpeg WASM 实例（由调用方创建后传入），把 Bink 视频写入
 * 虚拟 FS，按目标容器跑转码参数，读出结果并清理临时文件。
 *
 * 由 engine/gameRes/VideoConverter.ts.js 逆向翻译为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */

/** ffmpeg WASM 运行时的最小结构类型（FS/run 由 7z/ffmpeg 封装提供）。 */
export interface FfmpegRuntime {
  /** 虚拟文件系统操作：writeFile / readFile / unlink 等。 */
  FS: (op: string, ...args: any[]) => any;
  /** 执行转码命令行参数。 */
  run: (...args: string[]) => Promise<void>;
}

/** 转码输入：Bink 文件名 + 字节流。 */
export interface BinkVideoInput {
  /** 源文件名（含扩展名，如 "ra2ts_l.bik"）。 */
  filename: string;
  /** 文件内容的字节视图。 */
  stream: Uint8Array;
}

export class VideoConverter {
  /**
   * 将 Bink 视频转为 WebM（默认）或 MP4，返回编码后的字节。
   *
   * 流程与孪生一致：writeFile 源文件 → run 转码 → readFile 输出 → unlink 双向清理。
   *
   * @param ffmpeg 已加载的 ffmpeg 运行时。
   * @param input 源 Bink 文件名与字节流。
   * @param format 目标容器："webm"（默认）或 "mp4"（非 webm 走 libx264 分支）。
   * @returns 转码后的媒体字节。
   */
  async convertBinkVideo(ffmpeg: FfmpegRuntime, input: BinkVideoInput, format: string = "webm"): Promise<Uint8Array> {
    const srcName = input.filename;
    // 输出名：去掉原扩展名，换成目标格式扩展名
    const outName = input.filename.replace(/\.\w+$/, "") + "." + format;
    // 把输入流写入虚拟 FS（保留 buffer/byteOffset/byteLength 视图边界）
    ffmpeg.FS("writeFile", srcName, new Uint8Array(input.stream.buffer, input.stream.byteOffset, input.stream.byteLength));
    if (format === "webm") {
      // VP8/Vorbis：libvpx + 实时 deadline，画质 crf10、码率 2M、无音轨
      await ffmpeg.run(
        "-i",
        srcName,
        "-vcodec",
        "libvpx",
        "-crf",
        "10",
        "-b:v",
        "2M",
        "-deadline",
        "realtime",
        "-speed",
        "2",
        "-an",
        outName,
      );
    } else {
      // 非 webm：libx264 + crf25、2M、无音轨（参数列表与孪生一致）
      await ffmpeg.run(...["-i", srcName, "-vcodec", "libx264", "-crf", "25", "-b:v", "2M", "-an"], outName);
    }
    const encoded = ffmpeg.FS("readFile", outName) as Uint8Array;
    // 清理源文件与输出文件
    ffmpeg.FS("unlink", srcName);
    ffmpeg.FS("unlink", outName);
    return encoded;
  }
}
