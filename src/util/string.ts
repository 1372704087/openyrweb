/**
 * 字符串/字节序列工具。
 *
 * "binary string" 指每个字符对应一个字节（latin-1）的字符串，是 base64 与
 * Uint8Array 之间的桥梁。由 util/string.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */
import { Base64 } from "util/Base64";

/** 按字符逐个取 charCode（截断到 8 位）转为字节数组。 */
function binaryStringToUint8Array(input: string): Uint8Array {
  const length = input.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) bytes[i] = input.charCodeAt(i);
  return bytes;
}

/** 字节数组还原为 binary string。 */
function uint8ArrayToBinaryString(bytes: ArrayLike<number>): string {
  return Array.prototype.reduce.call(
    bytes,
    (acc: string, byte: number) => acc + String.fromCharCode(byte),
    "",
  );
}

/** 左侧补零/补前缀到 padString 的长度（超长则原样返回）。 */
export function pad(value: number | string, padString = "0000"): string {
  const str = "" + value;
  return padString.substring(0, padString.length - str.length) + str;
}

export function equalsIgnoreCase(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

export { binaryStringToUint8Array, uint8ArrayToBinaryString };

export function base64StringToUint8Array(input: string): Uint8Array {
  return binaryStringToUint8Array(Base64.decode(input));
}

export function uint8ArrayToBase64String(bytes: ArrayLike<number>): string {
  return Base64.encode(uint8ArrayToBinaryString(bytes));
}

/** UTF-16 字符串 → 大端 binary string（每字符拆高低字节）。 */
export function utf16ToBinaryString(input: string): string {
  const length = input.length;
  let out = "";
  for (let i = 0; i < length; i++) {
    const charCode = input.charCodeAt(i);
    out += String.fromCharCode(charCode >> 8);
    out += String.fromCharCode(255 & charCode);
  }
  return out;
}

/** 大端 binary string → UTF-16 字符串（每两字节合成一字符）。 */
export function binaryStringToUtf16(input: string): string {
  const length = input.length;
  let out = "";
  for (let i = 0; i < length; i += 2) {
    const charCode = (input.charCodeAt(i) << 8) + input.charCodeAt(i + 1);
    out += String.fromCharCode(charCode);
  }
  return out;
}

/** ArrayBuffer 按小端 4 字节组转连续十六进制字符串（每组 8 位补零）。 */
export function bufferToHexString(buffer: ArrayBuffer): string {
  const groups: string[] = [];
  const view = new DataView(buffer);
  for (let offset = 0; offset < view.byteLength; offset += 4) {
    const value = view.getUint32(offset);
    const hex = "00000000";
    groups.push((hex + value.toString(16)).slice(-hex.length));
  }
  return groups.join("");
}
