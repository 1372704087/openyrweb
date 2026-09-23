/**
 * Format5 — Westwood Format5（分块 LZO/Format80）解码器。
 *
 * 输入为若干块：每块 [compressedLen u16le][decompressedLen u16le][payload]。
 * compressedLen 或 decompressedLen 为 0 表示流结束。codec=80 走
 * Format80，否则走 MiniLzo（默认 5）。解码结果按 decompressedLen
 * 写入输出缓冲。
 *
 * 由 data/encoding/Format5.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 */
import { Format80 } from "data/encoding/Format80"; // 孪生
import { MiniLzo } from "data/encoding/MiniLzo"; // 本组已写

export class Format5 {
  /**
   * 解码到新分配的 Uint8Array。
   * @param src 压缩输入
   * @param destSize 输出缓冲字节数
   * @param codec 80=Format80，其它=MiniLzo（默认 5）
   */
  static decode(src: Uint8Array, destSize: number, codec = 5): Uint8Array {
    const out = new Uint8Array(destSize);
    this.decodeInto(src, out, codec);
    return out;
  }

  /**
   * 解码到调用方提供的输出缓冲（就地写入）。
   * @param src 压缩输入
   * @param dest 输出缓冲
   * @param codec 80=Format80，其它=MiniLzo（默认 5）
   */
  static decodeInto(src: Uint8Array, dest: Uint8Array, codec = 5): void {
    const destLen = dest.length;
    let si = 0;
    let di = 0;
    while (di < destLen) {
      const compLen = (src[si + 1] << 8) | src[si];
      si += 2;
      const rawLen = (src[si + 1] << 8) | src[si];
      si += 2;
      if (!compLen || !rawLen) break;
      let chunk: Uint8Array;
      if (codec === 80) chunk = Format80.decode(src.subarray(si, si + compLen), rawLen);
      else chunk = MiniLzo.decompress(src.subarray(si, si + compLen), rawLen);
      for (let t = 0; t < rawLen; ++t) dest[di + t] = chunk[t];
      si += compLen;
      di += rawLen;
    }
  }
}
