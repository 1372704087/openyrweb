/**
 * Base64 — 浏览器/Node 双端 base64 编解码。
 *
 * 优先使用 btoa/atob（浏览器），Node 环境回退到 Buffer（binary 字符串即
 * 每个 char 一个字节的 latin-1 串）。由 util/Base64.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包
 * 时优先采用 .ts 模块的编译产物。
 */
export class Base64 {
  /** binary string → base64。 */
  static encode(input: string): string {
    return globalThis.btoa !== undefined
      ? globalThis.btoa(input)
      : Buffer.from(input, "binary").toString("base64");
  }

  /** base64 → binary string。 */
  static decode(input: string): string {
    return globalThis.atob !== undefined
      ? globalThis.atob(input)
      : Buffer.from(input, "base64").toString("binary");
  }

  /** 判断字符串是否为合法 base64（长度为 4 的倍数，仅含字母数字 + / =）。 */
  static isBase64(input: string): boolean {
    return !!input.match(/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/);
  }
}
