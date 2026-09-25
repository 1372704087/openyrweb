/**
 * Strings — CSF/JSON 本地化字符串表。
 *
 * 键统一小写存储；值在 sanitize 时把 %hs 归一为 %s。get 支持
 * sprintf 风格参数；未命中时若键形如 "NOSTR:xxx" 则去掉前缀返回，
 * 否则按键原样返回并对同键只 warn 一次。
 *
 * 由 data/Strings.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { sprintf } from "sprintf-js"; // 已转换
import { CsfFile } from "data/CsfFile"; // 孪生

export class Strings {
  /** 键小写 → 字符串值。 */
  data: Record<string, unknown>;
  /** 已 warn 过的缺失键（避免刷屏）。 */
  warnedKeys: Set<string>;

  constructor(input?: unknown) {
    this.data = {};
    this.warnedKeys = new Set();
    if (input instanceof CsfFile) this.fromCsf(input);
    // 孪生无 null 守卫（typeof null === "object"，null 会进 fromJson 后抛错）
    else if (typeof input === "object") this.fromJson(input as Record<string, unknown>);
    // 诊断探针：控制台可经 window.__strings 检查解析后的字符串表
    (globalThis as any).__strings = this;
  }

  /** 从 CsfFile 载入（委托 data 字段）。 */
  fromCsf(file: CsfFile): void {
    this.fromJson(file.data as Record<string, unknown>);
  }

  /** 从普通对象逐键 setValue。 */
  fromJson(json: Record<string, unknown>): void {
    for (const key of Object.keys(json)) this.setValue(key, this.sanitizeValue(json[key]));
  }

  /** 把 CSF 中的 %hs 占位统一为 %s。 */
  sanitizeValue(e: unknown): unknown {
    return (e as string).replace(/%hs/g, "%s");
  }

  /** 按小写键写入。 */
  setValue(key: string, value: unknown): void {
    this.data[key.toLowerCase()] = value;
  }

  /** 是否存在非空值。 */
  has(key: string): boolean {
    return !!this.data[key.toLowerCase()];
  }

  /**
   * 取字符串；有变参则 sprintf 格式化。
   * 未命中：NOSTR: 前缀剥离后返回；否则原样返回并 warn 一次。
   */
  get(key: string, ...args: unknown[]): string {
    let value = this.data[key.toLowerCase()];
    if (value) {
      if (typeof value !== "string") {
        console.warn(`Invalid string value for name "${key}"`);
        return key;
      }
      if (args.length) value = sprintf(value as string, ...args);
      return value as string;
    }
    if (key.match(/^NOSTR:/i)) return key.replace(/^NOSTR:/i, "");
    const lower = key.toLowerCase();
    if (!this.warnedKeys.has(lower)) {
      this.warnedKeys.add(lower);
      // 与孪生一致：消息末尾多一个引号
      console.warn(`String with name "${key}" not found"`);
    }
    return key;
  }
}
