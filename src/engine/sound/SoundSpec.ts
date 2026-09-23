/**
 * SoundSpec — 单条 sound.ini 声音定义的解析器。
 *
 * read() 从 IniSection + 默认值填充本实例字段：控制位集合、样本名列表、
 * 音量/延迟/优先级/类型/循环次数等。Range 为 -2 时表示「无限制」→ Infinity。
 *
 * 由 engine/sound/SoundSpec.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
import { SoundControl, SoundPriority, SoundType, SoundSpecDefaults } from "engine/sound/SoundSpecs"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** min/max 配对（Delay/FShift/VShift 等随机区间）。 */
export interface MinMaxPair {
  min: number;
  max: number;
}

export class SoundSpec {
  /** 声音名（来自 section.name）。 */
  name!: string;
  /** 控制位集合（Loop/Random/Attack/…）。 */
  control!: Set<SoundControl>;
  /** 样本名列表（已去掉开头的 `$`）。 */
  sounds!: string[];
  /** 音量 0..100。 */
  volume!: number;
  /** 随机延迟区间（毫秒）。 */
  delay?: MinMaxPair;
  /** 优先级。 */
  priority!: SoundPriority;
  /** 空间类型（Screen/Local/Global/…）。 */
  type!: SoundType[];
  /** 音高随机偏移区间（百分之一）。 */
  fShift?: MinMaxPair;
  /** 同名并发上限。 */
  limit!: number;
  /** 循环次数；undefined 表示不循环（由 Loop 控制位决定）。 */
  loop?: number;
  /** 作用半径。 */
  range!: number;
  /** 最低音量（Global 型对敌方/远处使用）。 */
  minVolume!: number;
  /** 音量随机偏移区间（百分之一）。 */
  vShift?: MinMaxPair;
  /** attack 段样本数。 */
  attack?: number;
  /** decay 段样本数。 */
  decay?: number;

  /**
   * 从 INI section 读取全部字段（返回 this 便于链式调用）。
   * - Range === -2 → Infinity（孪生原样保留的哨兵约定）；
   * - Volume 键优先，否则回落到小写 "volume"（孪生原样保留）；
   * - Type 若缺少 Screen/Local/Global 之一，从默认值补一个。
   */
  read(section: any, defaults: SoundSpecDefaults): this {
    let range = section.getNumber("Range", defaults.range);
    if (range === -2) range = Number.POSITIVE_INFINITY;
    this.name = section.name;
    this.control = new Set(section.getEnumArray("Control", SoundControl, /\s+/, [], true));
    this.sounds = section.getArray("Sounds", /\s+/).map((s: string) => s.replace(/^\$/, ""));
    this.volume = section.has("Volume")
      ? section.getNumber("Volume", defaults.volume)
      : section.getNumber("volume", defaults.volume);
    this.delay = this.createMinMaxPair(section.getNumberArray("Delay", /\s+/, []));
    this.priority = section.getEnum("Priority", SoundPriority, defaults.priority, true);
    this.type = section.getEnumArray("Type", SoundType, /\s+/, defaults.type, true);
    if (!this.type.some((t) => [SoundType.Screen, SoundType.Local, SoundType.Global].includes(t))) {
      const fallback = defaults.type.find((t) => [SoundType.Screen, SoundType.Local, SoundType.Global].includes(t));
      if (fallback) this.type.push(fallback);
    }
    this.fShift = this.createMinMaxPair(section.getNumberArray("FShift", /\s+/, []));
    this.limit = section.getNumber("Limit", defaults.limit);
    this.loop = section.getNumber("Loop");
    this.range = range;
    this.minVolume = section.getNumber("MinVolume", defaults.minVolume);
    this.vShift = this.createMinMaxPair(section.getNumberArray(section.has("Vshift") ? "Vshift" : "VShift", /\s+/, []));
    this.attack = section.getNumber("Attack");
    this.decay = section.getNumber("Decay");
    return this;
  }

  /** 数字数组 → {min,max}；空数组返回 undefined；缺 max 时 max=min。 */
  createMinMaxPair(values: number[]): MinMaxPair | undefined {
    if (values.length) {
      let [min, max] = values;
      if (max === undefined) max = min;
      return { min, max };
    }
  }
}
