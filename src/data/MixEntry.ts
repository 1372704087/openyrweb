/**
 * MixEntry — MIX 包目录项 + Westwood 文件名哈希。
 *
 * 由 data/MixEntry.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * hashFilename：大写 → 非 4 倍数补长与填充 → CRC-32。
 */

import { binaryStringToUint8Array } from "util/string"; // 未转换（any-shim）
import { Crc32 } from "data/Crc32"; // 已转换

/** MIX 目录条目（12 字节）。 */
export class MixEntry {
  /** 目录项静态尺寸。 */
  static size = 12;

  hash: number;
  offset: number;
  length: number;

  /** Westwood 文件名 → CRC32 哈希。 */
  static hashFilename(filename: string): number {
    let name = filename.toUpperCase();
    const len = name.length;
    const blocks = len >> 2;
    if ((len & 3) !== 0) {
      name += String.fromCharCode(len - (blocks << 2));
      let pad = 3 - (len & 3);
      while (pad-- !== 0) {
        name += name[blocks << 2];
      }
    }
    return Crc32.calculateCrc(binaryStringToUint8Array(name));
  }

  constructor(hash: number, offset: number, length: number) {
    this.hash = hash;
    this.offset = offset;
    this.length = length;
  }
}
