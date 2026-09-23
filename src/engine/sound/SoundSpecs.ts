/**
 * SoundSpecs — sound.ini 的 Defaults + SoundList 解析与查询。
 *
 * 构造时立即 parse()：先读 [Defaults] 作为 SoundSpec.read 的默认值，
 * 再逐条读取 [SoundList] 中点名的 section。getSpec 支持大小写不敏感
 * 回落（原版 YR INI 不区分大小写）。
 *
 * 由 engine/sound/SoundSpecs.ts.js 重写为 TS（行为完全一致，枚举值与
 * 孪生逐值对齐）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs
 * 打包时优先采用 .ts 模块的编译产物。
 */
import { SoundSpec } from "engine/sound/SoundSpec"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 声音空间传播类型。 */
export enum SoundType {
  /** 全图可见（对敌方用 minVolume）。 */
  Global = 0,
  /** 普通（无空间衰减）。 */
  Normal = 1,
  /** 屏幕空间（按到视口距离衰减、声像随视口偏移）。 */
  Screen = 2,
  /** 世界局部（按 tile 距离与 range 衰减）。 */
  Local = 3,
  /** 仅所属玩家可听。 */
  Player = 4,
  /** 迷雾外区域（与 Unshroud 成对用于遮蔽逻辑）。 */
  Unshroud = 5,
  /** 迷雾内区域。 */
  Shroud = 6,
}

/** 声音优先级（同名并发时的抢占参考）。 */
export enum SoundPriority {
  Lowest = 0,
  Low = 1,
  Normal = 2,
  High = 3,
  Critical = 4,
}

/** 声音控制位（INI Control 字段按空白拆分）。 */
export enum SoundControl {
  All = 0,
  Loop = 1,
  Random = 2,
  Predelay = 3,
  Interrupt = 4,
  Attack = 5,
  Decay = 6,
  Ambient = 7,
}

/** [Defaults] section 提供的默认值集合。 */
export interface SoundSpecDefaults {
  minVolume?: number;
  range?: number;
  volume?: number;
  limit?: number;
  type?: SoundType[];
  priority?: SoundPriority;
}

export class SoundSpecs {
  /** INI 文件句柄。 */
  ini: any;
  /** 声音名 → SoundSpec。 */
  specs = new Map<string, SoundSpec>();
  /** 小写名 → 原始名（大小写不敏感查找用）。 */
  specsLower = new Map<string, string>();
  /** [Defaults] 解析结果（无该 section 时为 undefined，且不解析 SoundList）。 */
  defaults?: SoundSpecDefaults;

  constructor(ini: any) {
    this.ini = ini;
    this.parse();
  }

  /**
   * 解析 [Defaults] 与 [SoundList]：
   * - 缺 [Defaults]：警告并跳过全部；
   * - 缺 [SoundList]：警告但仍保留 defaults。
   */
  parse(): void {
    const defaultsSection = this.ini.getSection("Defaults");
    if (defaultsSection) {
      this.defaults = {
        minVolume: defaultsSection.getNumber("MinVolume"),
        range: defaultsSection.getNumber("Range"),
        volume: defaultsSection.getNumber("Volume"),
        limit: defaultsSection.getNumber("Limit"),
        type: defaultsSection.getEnumArray("Type", SoundType, /\s+/, [], true),
        priority: defaultsSection.getEnum("Priority", SoundPriority, SoundPriority.Normal, true),
      };
      const listSection = this.ini.getSection("SoundList");
      if (listSection) {
        for (const name of new Set<string>(listSection.entries.values())) {
          if (name) {
            const section = this.ini.getSection(name);
            if (section) {
              this.specs.set(name, new SoundSpec().read(section, this.defaults));
              this.specsLower.set(name.toLowerCase(), name);
            } else {
              console.warn(`Missing sound section [${name}]`);
            }
          }
        }
      } else {
        console.warn("Missing sound [SoundList] section. Sounds will not be played.");
      }
    } else {
      console.warn("Missing sound [Defaults] section. Sounds will not be played.");
    }
  }

  /**
   * 按名查询；精确匹配失败后走小写索引回落。
   * （孪生中的英文注释原样保留在实现里。）
   */
  getSpec(name: string): SoundSpec | undefined {
    const spec = this.specs.get(name);
    if (spec) return spec;
    // Case-insensitive fallback (original YR INI is case-insensitive)
    const key = this.specsLower.get(("" + name).toLowerCase());
    return key ? this.specs.get(key) : undefined;
  }

  /** 返回全部 SoundSpec 的数组快照。 */
  getAll(): SoundSpec[] {
    return [...this.specs.values()];
  }
}
