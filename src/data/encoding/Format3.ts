/**
 * Format3 — Westwood Format3（RLE 类）解码器。
 *
 * 每行以小端 uint16 字节流长度前缀（含 2 字节长度自身），随后为
 * RLE 码流：非 0 字节原样输出；0 字节后跟一个计数 n，表示输出 n 个
 * 0（并从行长度中扣减 1）。
 *
 * 由 data/encoding/Format3.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 */
export class Format3 {
  /**
   * 解码 Format3 压缩数据为 width×height 的字节缓冲。
   * @param src 压缩输入
   * @param width 每行像素宽度
   * @param height 行数
   */
  static decode(src: Uint8Array, width: number, height: number): Uint8Array {
    const out = new Uint8Array(width * height);
    let si = 0;
    let oi = 0;
    for (let row = 0; row < height; row++) {
      // 行字节流长度 = 小端 uint16（含长度字段自身 2 字节）
      let remaining = ((src[si + 1] << 8) | src[si]) - 2;
      si += 2;
      let x = 0;
      while (remaining-- > 0) {
        let b = src[si++];
        if (b !== 0) {
          x++;
          out[oi++] = b;
        } else {
          // 0 后跟计数字节：写入 n 个 0；行剩余长度再减 1
          remaining--;
          b = src[si++];
          if (x + b > width) b = (width - x) & 255;
          x += b;
          while (b-- !== 0) out[oi++] = 0;
        }
      }
    }
    return out;
  }
}
