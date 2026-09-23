/**
 * MapNameLegacyEncoder — 旧版地图标题位打包编解码。
 *
 * 由 network/gameopt/MapNameLegacyEncoder.ts.js 重写为 TS（行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 *
 * 关键语义（勿改）：位移量 `2*charIndex - 7*groupIndex`、7bit 分组、
 * 组首 XOR 0x80、末尾补 0 与孪生逐行一致。算法不可“优化”。
 */

/** 旧版地图标题编解码器。 */
export class MapNameLegacyEncoder {
  /**
   * 将地图标题编码为旧版 gameopt 字符串。
   * @param title 原始地图标题
   * @returns 编码后的字符串（每字节已 XOR 0x80）
   */
  encode(title: string): string {
    let bytes: number[] = [];
    let group = 0;
    title.split("").forEach((ch, idx) => {
      const packed = ch.charCodeAt(0) << (2 * idx - 7 * group);
      const b0 = packed & 127;
      const b1 = (packed >> 7) & 127;
      const b2 = (packed >> 14) & 127;
      if (b2) group++;
      bytes.push(b0, b1);
      if (b2) bytes.push(b2);
    });
    bytes.push(0, 0);
    if (title.length >= 2) bytes.push(0);
    bytes = bytes.map((b) => 128 ^ b);
    return bytes.map((b) => String.fromCharCode(b)).join("");
  }

  /**
   * 将旧版 gameopt 字符串解码为地图标题。
   * @param encoded 编码后的字符串
   * @returns 原始地图标题
   */
  decode(encoded: string): string {
    let bytes = encoded.split("").map((ch) => ch.charCodeAt(0));
    bytes = bytes.map((b) => 128 ^ b);
    while (bytes.length && bytes[bytes.length - 1] === 0) bytes.pop();

    const out: number[] = [];
    let group = 0;
    let groupsUsed = 0;
    while (bytes.length) {
      const pos = out.length;
      const b0 = bytes.shift() as number;
      const b1 = bytes.shift() as number;
      let b2 = 0;
      let hasExtra = false;
      if ([1, 2, 3].indexOf(bytes[0]) !== -1 || pos > groupsUsed + 3) {
        b2 = bytes.shift() as number;
        groupsUsed = pos;
        hasExtra = true;
      }
      const ch = ((b2 << 14) | (b1 << 7) | b0) >> (2 * pos - 7 * group);
      out.push(ch & 127);
      if (hasExtra) group++;
    }
    return out.map((b) => String.fromCharCode(b)).join("");
  }
}
