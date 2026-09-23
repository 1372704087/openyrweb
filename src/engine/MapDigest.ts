/**
 * MapDigest — 地图内容摘要（CRC32 十六进制串）。
 *
 * 由 engine/MapDigest.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { Crc32 } from "data/Crc32"; // 已转换

/** 可读取字节的地图/文件对象。 */
export interface DigestSource {
  getBytes(): Uint8Array;
}

/**
 * 地图摘要工具（仅静态方法）。
 */
export class MapDigest {
  /**
   * 计算源字节的 CRC32，返回不带 0x 前缀的小写十六进制串。
   * @param e - 含 getBytes() 的源
   */
  static compute(e: DigestSource): string {
    return Crc32.calculateCrc(e.getBytes()).toString(16);
  }
}
