/**
 * IniSection — INI 节点：键值对 + 嵌套子节 的树形数据载体。
 *
 * 由 data/IniSection.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 访问器语义与孪生一致：非法数字/枚举 console.warn 并回落默认值；
 * getFixed 使用 16.16 定点截断；toString 按 Map 插入序输出。
 */

/** 节内可存的值：标量、数组；嵌套对象仅经 fromJson 转为子节。 */
export type IniValue = string | number | boolean | any[] | undefined;

/** INI 节。 */
export class IniSection {
  /** 键 → 值（Map 保插入序）。 */
  entries: Map<string, IniValue> = new Map();
  /** 子节名 → 子节。 */
  sections: Map<string, IniSection> = new Map();
  /** 节名。 */
  name: string;

  constructor(name: string) {
    this.entries = new Map();
    this.sections = new Map();
    this.name = name;
  }

  /** 从 plain JSON 灌入：普通值进 entries，纯对象递归为子节。 */
  fromJson(obj: Record<string, any>): this {
    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) continue;
      const value = obj[key];
      if (Array.isArray(value) || typeof value !== "object") {
        this.set(key, value);
      } else {
        this.sections.set(key, new IniSection(key).fromJson(value));
      }
    }
    return this;
  }

  /** 深拷贝本节（含全部子节）。 */
  clone(): IniSection {
    const copy = new IniSection(this.name);
    this.entries.forEach((value, key) => {
      copy.set(key, value);
    });
    this.sections.forEach((section, key) => {
      copy.sections.set(key, section.clone());
    });
    return copy;
  }

  set(key: string, value: IniValue): void {
    this.entries.set(key, value);
  }

  get(key: string): IniValue {
    return this.entries.get(key);
  }

  has(key: string): boolean {
    return this.entries.has(key);
  }

  getString(key: string, fallback = ""): string {
    const value = this.get(key);
    return value && typeof value === "string" ? value : fallback;
  }

  getNumber(key: string, fallback = 0): number {
    const value = this.get(key);
    if (!value || typeof value !== "string") return fallback;
    const parsed = this.parseNumber(value);
    if (parsed === undefined) {
      console.warn(`Invalid value for key ${key}. "${value}" is not a valid number or percentage string.`);
      return fallback;
    }
    return parsed;
  }

  /** 解析数字：统一 ","→"."，"xx%" ÷100；失败返回 undefined。 */
  parseNumber(str: string): number | undefined {
    let n: number;
    str = str.replace(",", ".");
    n = str.match(/%$/) ? Number(str.replace("%", "")) / 100 : Number(str);
    if (!isNaN(n)) return n;
    return undefined;
  }

  getFixed(key: string, fallback = 0): number {
    return this.toFixedPointPrecision(this.getNumber(key, fallback));
  }

  /** 16.16 定点截断。 */
  toFixedPointPrecision(n: number): number {
    return ((65536 * n) | 0) / 65536;
  }

  getBool(key: string, fallback = false): boolean {
    let str = this.getString(key).trim();
    str = str && str.toLowerCase();
    if (!str || ["yes", "1", "true", "on"].indexOf(str) === -1) {
      if (!str || ["no", "0", "false", "off"].indexOf(str) === -1) return fallback;
      return false;
    }
    return true;
  }

  getKeyArray(key: string, fallback: any[] = []): any[] {
    const value = this.get(key);
    return value && Array.isArray(value) ? value : fallback;
  }

  getArray(key: string, separator: RegExp = /,\s*/, fallback: string[] = []): string[] {
    let str = this.getString(key).trim();
    str = str.replace(/,$/, "").replace(/,+/g, ",");
    return str ? str.split(separator) : fallback;
  }

  getNumberArray(key: string, separator: RegExp = /,\s*/, fallback: number[] = []): number[] {
    const str = this.getString(key).trim();
    if (!str) return fallback;
    const out: number[] = [];
    for (const part of str.split(separator)) {
      if (!part) return fallback;
      const n = this.parseNumber(part);
      if (n === undefined) {
        console.warn(`Invalid value for key ${key}. "${part}" is not a valid number or percentage string.`);
        return fallback;
      }
      out.push(n);
    }
    return out;
  }

  getFixedArray(key: string, separator: RegExp = /,\s*/, fallback: number[] = []): number[] {
    return this.getNumberArray(key, separator, fallback).map((n) => this.toFixedPointPrecision(n));
  }

  getEnum<T>(key: string, enumObj: Record<string, T>, fallback: T, ignoreCase = false): T {
    const str = this.getString(key).trim();
    if (!str) return fallback;
    let found: T | undefined;
    if (ignoreCase) {
      const names = Object.getOwnPropertyNames(enumObj);
      const hit = names.find((n) => n.toLowerCase() === str.toLowerCase());
      if (hit) found = enumObj[hit];
    } else if (enumObj.hasOwnProperty(str)) {
      found = enumObj[str];
    }
    if (found === undefined) {
      console.warn(`Invalid value for key "${key}". "${str}" is not an accepted enum value.`);
      return fallback;
    }
    return found;
  }

  getEnumNumeric(key: string, enumObj: Record<string, any>, fallback: number): number {
    const str = this.getString(key).trim();
    if (!str) return fallback;
    let found: number | undefined;
    if (Number.isInteger(parseInt(str, 10)) && enumObj.hasOwnProperty(str)) {
      found = parseInt(str, 10);
    }
    if (found === undefined) {
      console.warn(`Invalid value for key "${key}". "${str}" is not an accepted enum value.`);
      return fallback;
    }
    return found;
  }

  getEnumArray<T>(
    key: string,
    enumObj: Record<string, T>,
    separator: RegExp = /,\s*/,
    fallback: T[] = [],
    ignoreCase = false,
  ): T[] {
    const str = this.getString(key).trim();
    if (!str) return fallback;
    const out: T[] = [];
    for (const part of str.split(separator)) {
      if (!part) return fallback;
      let ok = false;
      if (ignoreCase) {
        const names = Object.getOwnPropertyNames(enumObj);
        const hit = names.find((n) => n.toLowerCase() === part.toLowerCase());
        if (hit) {
          out.push(enumObj[hit]);
          ok = true;
        }
      } else if (enumObj.hasOwnProperty(part)) {
        out.push(enumObj[part]);
        ok = true;
      }
      if (!ok) {
        console.warn(`Invalid value "${part}" for key "${key}".`);
        return fallback;
      }
    }
    return out;
  }

  getHighestNumericIndex(): number {
    let max = 0;
    this.entries.forEach((_value, key) => {
      const n = parseInt(key, 10);
      if (n > max) max = n;
    });
    return max;
  }

  isNumericIndexArray(): boolean {
    return this.getHighestNumericIndex() > 0 || this.has("0");
  }

  getConcatenatedValues(): string {
    let out = "";
    for (const value of this.entries.values()) {
      if (typeof value === "string") out += value;
    }
    return out;
  }

  /** 序列化为 INI；parent 用于嵌套节名 parent.child。 */
  toString(parent?: string): string {
    const lines: string[] = [];
    const fullName = parent ? parent + "." + this.name : this.name;
    lines.push(`[${fullName}]`);
    for (const [key, value] of this.entries) {
      if (Array.isArray(value)) {
        for (const item of value) lines.push(key + "[]=" + item);
      } else {
        lines.push(key + "=" + value);
      }
    }
    lines.push("");
    return (
      lines.join("\r\n") +
      [...this.sections.values()].map((section) => section.toString(fullName)).join("\r\n")
    );
  }

  /** 合并另一节：数字下标追加，否则覆盖；子节递归。 */
  mergeWith(other: IniSection): void {
    if (this.isNumericIndexArray()) {
      let next = this.getHighestNumericIndex() + 1;
      other.entries.forEach((value, key) => {
        if (Number.isNaN(Number(key))) return;
        if (Array.isArray(value)) return;
        this.set((next++).toString(), value);
      });
    } else {
      other.entries.forEach((value, key) => {
        this.set(key, Array.isArray(value) ? [...value] : value);
      });
    }
    other.sections.forEach((section, key) => {
      this.getOrCreateSection(key).mergeWith(section);
    });
  }

  getOrCreateSection(name: string): IniSection {
    let section = this.sections.get(name);
    if (!section) {
      section = new IniSection(name);
      this.sections.set(name, section);
    }
    return section;
  }

  getSection(name: string): IniSection | undefined {
    return this.sections.get(name);
  }

  getOrderedSections(): IniSection[] {
    return [...this.sections.values()];
  }
}
