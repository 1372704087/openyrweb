/**
 * FileNameEncoder — 地图文件名编解码（合法文件名透传，否则 Base64）。
 *
 * 由 network/gameopt/FileNameEncoder.ts.js 重写为 TS（行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 *
 * 关键语义（勿改）：
 * - encode：匹配 `^[a-z0-9-_]+\.[a-z]{3}$` 则原样返回，否则 utf16→binary 再 Base64。
 * - decode：匹配 `\.[a-z]{3}$` 则原样返回，否则 Base64→binary 再转 utf16。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

import { Base64 } from "util/Base64"; // 孪生
import { binaryStringToUtf16, utf16ToBinaryString } from "util/string"; // 孪生

/** 地图文件名编解码器。 */
export class FileNameEncoder {
  /**
   * 将地图文件名编码为 gameopt 协议字段。
   * @param name 原始文件名
   * @returns 已是简单 `name.ext` 形状则原样返回，否则 Base64 文本
   */
  encode(name: string): string {
    return name.match(/^[a-z0-9-_]+\.[a-z]{3}$/i) ? name : Base64.encode(utf16ToBinaryString(name));
  }

  /**
   * 将 gameopt 协议字段解码为地图文件名。
   * @param encoded 协议字段（简单文件名或 Base64）
   * @returns 解码后的文件名
   */
  decode(encoded: string): string {
    return encoded.match(/\.[a-z]{3}$/i) ? encoded : binaryStringToUtf16(Base64.decode(encoded));
  }
}
