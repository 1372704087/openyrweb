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

/** 逐字节按位取反（CSF 值是反码存储）；须掩码回 8 位——
 * 原 `~b >>> 0` 会得到 0xFFFFFFxx，UTF-16 配对后恒为 0xFFxx 乱码
 * （实测标准 CSF 该写法解出 "ｈｩ" 而非 "Hi"），且乱码触发 GBK 误回退、
 * sprintf 遇 %\0 抛 unexpected placeholder。 */
function invertBytes(bytes: Uint8Array): number[] {
  const out: number[] = [];
  for (let i = 0; i < bytes.length; i++) out.push(~bytes[i] & 0xff);
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

/**
 * 判断字符串是否呈编码误读乱码特征：
 * 全角形式区（FF01-FF5E）、半角假名（FF61-FF9F）、￥￠（FFE0-FFEF）、
 * 韩文（AC00-D7A3）、PUA（E000-F8FF）密集且压过正常文字——
 * 中文 mod 的 CSF 常把 GBK/BIG5 字节直接存储，UTF-16 配对解读必出此形态。
 */
function looksLikeGbkMojibake(s: string): boolean {
  let bad = 0;
  let good = 0;
  for (const ch of s) {
    const c = ch.codePointAt(0) as number;
    if (
      (c >= 0xff01 && c <= 0xff5e) ||
      (c >= 0xff61 && c <= 0xff9f) ||
      (c >= 0xffe0 && c <= 0xffef) ||
      (c >= 0xac00 && c <= 0xd7a3) ||
      (c >= 0xe000 && c <= 0xf8ff)
    )
      bad++;
    else if ((c >= 0x4e00 && c <= 0x9fff) || (c >= 0x20 && c <= 0x7e)) good++;
  }
  return bad >= 2 && bad >= good;
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
    // 头部自带语言字段时也要应用 CJK 编码偏好（autoDetectLocale 仅在 Unknown 时跑）
    this.applyCjkEncodingPreference();

    for (let n = 0; n < labelCount; n++) {
      s.readInt32(); // type（" LBL"）
      // 该 u32 是标签内字符串数量（原版误当标志位：偶数时整标签存空串且流不消费，
      // 导致后续全部标签错位乱码——用户大厅截图即此症状）
      const numStrings = s.readInt32();
      const name = s.readString(s.readInt32());

      // 逐字符串块解析（游戏取第一串为值；第二串为"定义"备选文本）
      let value = "";
      for (let i = 0; i < numStrings; i++) {
        const hasStrw = s.readInt32() === STRW_MAGIC;
        const raw = invertBytes(s.readUint8Array(2 * s.readInt32()));
        let str = utf16LeBytesToString(raw);
        // 简中 CSF 常把 GBK 字节直接反转存储：UTF-16 配对解读必成韩文/假名乱码，按 GBK 重解
        if (looksLikeGbkMojibake(str)) {
          // 留存原始字节供诊断（window.__csfGarbled）
          const g = globalThis as any;
          (g.__csfGarbled ||= []).push({
            key: name,
            utf16: str,
            bytes: Array.from(raw)
              .map((b) => b.toString(16).padStart(2, "0"))
              .join(" "),
          });
          try {
            str = new TextDecoder("gbk").decode(new Uint8Array(raw));
          } catch {
            // 无 GBK 解码器：保留 UTF-16 解读
          }
        }
        if (i === 0) value = str;
        if (hasStrw) s.readString(s.readInt32());
      }
      this.data[name] = value;
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
        break;
    }
    this.applyCjkEncodingPreference();
  }

  /**
   * 把检测到的 UI 语言映射为 CJK 编码偏好（供 INI 解码使用）：
   * 繁中 mod 的 rules.ini/地图 INI 是 BIG5，简中是 GBK。
   * GBK 与 BIG5 解码多数中文都无替换符，仅按 U+FFFD 计分区分不了，
   * 必须依赖语言偏好定优先级，否则繁中 INI 会被按 GBK 解成乱码。
   */
  applyCjkEncodingPreference(): void {
    if (typeof globalThis === "undefined") return;
    if (this.language === CsfLanguage.ChineseTW) (globalThis as any).__yrwebCjkEncoding = "big5";
    else if (this.language === CsfLanguage.ChineseCN) (globalThis as any).__yrwebCjkEncoding = "gbk";
  }

  /** 取当前语言的 ISO 区域码；无映射时返回 undefined。 */
  getIsoLocale(): string | undefined {
    return csfLocaleMap.get(this.language);
  }
}
