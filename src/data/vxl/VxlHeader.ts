/**
 * VxlHeader — VXL 文件 32 字节总头。
 *
 * 布局：fileName(16 CString) + paletteCount/u32 + headerCount/u32 +
 * tailerCount/u32 + bodySize/u32 + paletteRemapStart/u8 +
 * paletteRemapEnd/u8 + 跳过 768 字节调色板。
 * 静态 size = 32（不含调色板区；VxlFile 用它做最小长度判断）。
 *
 * 由 data/vxl/VxlHeader.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import type { DataStream } from '../DataStream';

export class VxlHeader {
  /** 总头结构长度（字节，不含 768 调色板）。 */
  static size = 32;

  fileName?: string;
  paletteCount?: number;
  headerCount?: number;
  tailerCount?: number;
  bodySize?: number;
  paletteRemapStart?: number;
  paletteRemapEnd?: number;

  /** 从当前 stream 位置读满总头并跳过调色板。 */
  read(stream: DataStream): void {
    this.fileName = stream.readCString(16);
    this.paletteCount = stream.readUint32();
    this.headerCount = stream.readUint32();
    this.tailerCount = stream.readUint32();
    this.bodySize = stream.readUint32();
    this.paletteRemapStart = stream.readUint8();
    this.paletteRemapEnd = stream.readUint8();
    stream.seek(stream.position + 768); // 256×RGB 调色板
  }
}
