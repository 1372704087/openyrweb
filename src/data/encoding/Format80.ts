/**
 * Format80 — Westwood RLE（LCW/Format80）解码。
 *
 * 由 data/encoding/Format80.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 指令：0b0 短回拷；0b10 字面量（len=0 结束）；
 * 0b11 + 62 填充、63 长回拷、其余 count=3+x 中距离回拷。
 */

import { DataStream } from "data/DataStream"; // 本组已写

/** Format80 解码器。 */
export class Format80 {
  static decode(compressed: Uint8Array, outSize: number): Uint8Array {
    const out = new Uint8Array(outSize);
    this.decodeInto(compressed, out);
    return out;
  }

  static decodeInto(compressed: Uint8Array, out: Uint8Array): number {
    const stream = new DataStream(new DataView(compressed.buffer, compressed.byteOffset, compressed.byteLength));
    let dest = 0;
    for (;;) {
      const cmd = stream.readUint8();

      if ((cmd & 0x80) === 0) {
        const low = stream.readUint8();
        const count = 3 + ((cmd & 0x70) >> 4);
        this.replicatePrevious(out, dest, dest - (((cmd & 0x0f) << 8) + low), count);
        dest += count;
      } else if ((cmd & 0x40) === 0) {
        const len = cmd & 0x3f;
        if (len === 0) return dest;
        out.set(stream.readUint8Array(len), dest);
        dest += len;
      } else {
        const kind = cmd & 0x3f;
        if (kind === 62) {
          const count = stream.readInt16();
          const value = stream.readUint8();
          const end = dest + count;
          for (; dest < end; dest++) out[dest] = value;
        } else if (kind === 63) {
          const count = stream.readInt16();
          let src = stream.readInt16();
          if (src >= dest) throw new Error(`srcIndex >= destIndex  ${src}  ` + dest);
          const end = dest + count;
          for (; dest < end; dest++) out[dest] = out[src++];
        } else {
          const count = 3 + kind;
          let src = stream.readInt16();
          if (src >= dest) throw new Error(`srcIndex >= destIndex  ${src}  ` + dest);
          const end = dest + count;
          for (; dest < end; dest++) out[dest] = out[src++];
        }
      }
    }
  }

  /** 距离 1 时按逐字节重复，否则整段复制。 */
  static replicatePrevious(out: Uint8Array, dest: number, src: number, count: number): void {
    if (dest < src) throw new Error(`srcIndex > destIndex  ${src}  ` + dest);
    if (dest - src === 1) {
      for (let i = 0; i < count; i++) out[dest + i] = out[dest - 1];
    } else {
      for (let i = 0; i < count; i++) out[dest + i] = out[src + i];
    }
  }
}
