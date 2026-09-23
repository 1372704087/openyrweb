/**
 * CsfFile — Westwood CSF（Compiler String File）本地化字符串表解析。
 *
 * 由 data/CsfFile.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 二进制要点（读序勿改）：
 * 1. 头：magic×2、label 计数、再 2×int32、language:int32。
 * 2. 每条 label：type、flags、nameLen、name；flags&1 时为带值串：
 *    值经按位取反的 UTF-16LE 字节 → 还原后 little-endian 拼 char；
 *    若首 word 为 "STRW" 魔数则再跳过一段 extra 字符串。
 * 3. language==Unknown 时按 "THEME:Intro" 文案自动探测简繁。
 */

/** CSF 语言枚举（数值与孪生一致）。 */
export enum CsfLanguage {
  EnglishUS = 0,
  EnglishUK = 1,
  German = 2,
  French = 3,
  Spanish = 4,
  Italian = 5,
  Japanese = 6,
  Jabberwockie = 7,
  Korean = 8,
  Unknown = 9,
  ChineseCN = 100,
  ChineseTW = 101,
}

/** 语言 → BCP-47/ISO 区域码。 */
export const csfLocaleMap: Map<CsfLanguage, string> = new Map<CsfLanguage, string>()
  .set(CsfLanguage.EnglishUS, "en-US")
  .set(CsfLanguage.EnglishUK, "en-GB")
  .set(CsfLanguage.German, "de-DE")
  .set(CsfLanguage.French, "fr-FR")
  .set(CsfLanguage.Spanish, "es-ES")
  .set(CsfLanguage.Italian, "it-IT")
  .set(CsfLanguage.Japanese, "ja-JP")
  .set(CsfLanguage.Korean, "ko-KR")
  .set(CsfLanguage.ChineseCN, "zh-CN")
  .set(CsfLanguage.ChineseTW, "zh-TW");

/** "STRW" 按 little-endian uint32 打包后的魔数（字节序与孪生构造一致）。 */
const STRW_MAGIC = new Uint32Array(
  new Uint8Array(Array.prototype.map.call("STRW", (ch: string) => ch.charCodeAt(0)).reverse()).buffer,
)[0];

/** 逐字节按位取反（CSF 值是反码存储）；与孪生 map → ~e >>> 0 一致。 */
function invertBytes(bytes: Uint8Array): number[] {
  const out: number[] = [];
  for (let i = 0; i < bytes.length; i++) out.push(~bytes[i] >>> 0);
  return out;
}

/** 将 UTF-16LE 字节对还原为字符串（每 2 字节一个 char）。 */
function utf16LeBytesToString(values: number[]): string {
  let out = "";
  for (let i = 0; i < values.length; i += 2) {
    out += String.fromCharCode((values[i + 1] << 8) | values[i]);
  }
  return out;
}

/** CSF 字符串表。构造可选传入 VirtualFile 形状对象直接解析。 */
export class CsfFile {
  /** 当前语言（默认 Unknown）。 */
  language: CsfLanguage = CsfLanguage.Unknown;
  /** label → 字符串值。 */
  data: Record<string, string> = {};

  constructor(file?: { stream: any }) {
    this.language = CsfLanguage.Unknown;
    this.data = {};
    if (file) this.fromVirtualFile(file);
  }

  /** 从 VirtualFile.stream 顺序解析整个 CSF。 */
  fromVirtualFile(file: { stream: any }): void {
    const s = file.stream;
    s.readInt32(); // magic
    s.readInt32(); // version
    const labelCount = s.readInt32();
    s.readInt32();
    s.readInt32();
    this.language = s.readInt32();

    for (let n = 0; n < labelCount; n++) {
      s.readInt32(); // type
      let flags = s.readInt32();
      const name = s.readString(s.readInt32());

      if ((flags & 1) !== 0) {
        const hasStrw = s.readInt32() === STRW_MAGIC;
        const inverted = invertBytes(s.readUint8Array(2 * s.readInt32()));
        const value = utf16LeBytesToString(inverted);
        if (hasStrw) s.readString(s.readInt32());
        this.data[name] = value;
      } else {
        this.data[name] = "";
      }
    }

    if (this.language === CsfLanguage.Unknown) this.autoDetectLocale();
  }

  /** 用主题开场文案区分简体/繁体（仅当 Unknown 时调用）。 */
  autoDetectLocale(): void {
    switch (this.data["THEME:Intro"]) {
      case "開場":
        this.language = CsfLanguage.ChineseTW;
        break;
      case "开场":
        this.language = CsfLanguage.ChineseCN;
    }
  }

  /** 取当前语言的 ISO 区域码；无映射时返回 undefined。 */
  getIsoLocale(): string | undefined {
    return csfLocaleMap.get(this.language);
  }
}
