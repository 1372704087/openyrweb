/**
 * IniFile — INI 配置文件聚合根（节名 → IniSection）。
 *
 * 构造时按入参类型自动分派：VirtualFile / 纯 JSON 对象 / 原始字符串。
 * toString 按插入顺序以 \r\n 连接各节；clone 深拷贝所有节；
 * mergeWith 将另一文件的节并入当前文件（节内合并委托 IniSection）。
 *
 * 由 data/IniFile.ts.js 重写为 TS（行为完全一致）。两个文件并存
 * 期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { IniSection } from './IniSection';
import { IniParser } from './IniParser';
import { VirtualFile } from './vfs/VirtualFile';

/** 可被 fromJson 消费的 JSON 形态：节名 → 原始 JSON 树。 */
export type IniJson = Record<string, unknown>;

export class IniFile {
  /** 节名 → 节对象（Map 保插入序）。 */
  sections: Map<string, IniSection> = new Map();

  constructor(src?: VirtualFile | IniJson | string) {
    this.sections = new Map();
    if (src instanceof VirtualFile) this.fromVirtualFile(src);
    else if (typeof src === 'object' && src !== null) this.fromJson(src);
    else if (typeof src === 'string') this.fromString(src);
  }

  /** 从 VirtualFile 读取全文并解析。 */
  fromVirtualFile(file: VirtualFile): this {
    return this.fromString(file.readAsString());
  }

  /** 从 INI 文本解析。 */
  fromString(text: string): this {
    return this.fromJson(new IniParser().parse(text));
  }

  /** 从已解析的 JSON 树构建各节（仅自有可枚举属性）。 */
  fromJson(json: IniJson): this {
    for (const key in json) {
      if (Object.prototype.hasOwnProperty.call(json, key)) {
        const section = new IniSection(key).fromJson(json[key] as Record<string, unknown>);
        this.sections.set(key, section);
      }
    }
    return this;
  }

  /** 序列化回 INI 文本（节间 \r\n 连接）。 */
  toString(): string {
    const parts: string[] = [];
    for (const section of this.sections.values()) parts.push(section.toString());
    return parts.join('\r\n');
  }

  /** 深拷贝（节与子节均 clone）。 */
  clone(): IniFile {
    const copy = new IniFile();
    this.sections.forEach((section, name) => {
      copy.sections.set(name, section.clone());
    });
    return copy;
  }

  /** 取节；不存在则新建空节并登记。 */
  getOrCreateSection(name: string): IniSection {
    let section = this.sections.get(name);
    if (!section) {
      section = new IniSection(name);
      this.sections.set(name, section);
    }
    return section;
  }

  /** 取节；可能为 undefined。 */
  getSection(name: string): IniSection | undefined {
    return this.sections.get(name);
  }

  /** 按插入顺序返回全部节。 */
  getOrderedSections(): IniSection[] {
    return [...this.sections.values()];
  }

  /** 将另一 IniFile 的各节按名并入当前文件。 */
  mergeWith(other: IniFile): this {
    other.sections.forEach((section, name) => {
      const target = this.getOrCreateSection(name);
      target.mergeWith(section);
    });
    return this;
  }
}
