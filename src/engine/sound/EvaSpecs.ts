/**
 * EvaSpecs — eva.ini 的 DialogList 解析与按阵营取 EVA 播报定义。
 *
 * 构造给定 SideType 后，readIni() 读 [DialogList] 列出的每个对话 section，
 * 并按「当前阵营对应的音轨列名」取出 sound 文件名、文本、优先级与是否排队。
 *
 * 由 engine/sound/EvaSpecs.ts.js 重写为 TS（行为完全一致，枚举值与
 * 孪生逐值对齐）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs
 * 打包时优先采用 .ts 模块的编译产物。
 */
import { SideType } from "game/SideType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 阵营 → eva.ini 中音轨列名的映射（与孪生一致的模块内私有 Map，
 * 不对外导出）。
 */
const sideSoundColumn = new Map<SideType, string>()
  .set(SideType.GDI, "Allied")
  .set(SideType.Nod, "Russian")
  .set(SideType.ThirdSide, "Yuri");

/** EVA 播报优先级（数值越大越先播）。 */
export enum EvaPriority {
  Low = 0,
  Normal = 1,
  Important = 2,
  Critical = 3,
}

/** 单条 EVA 播报定义。 */
export interface EvaSpec {
  /** 屏幕文本（Text 字段）。 */
  text: string;
  /** 音频资源键（按阵营列取）。 */
  sound: string;
  /** 优先级。 */
  priority: EvaPriority;
  /** 是否排入队列（Type === "queue"）。 */
  queue: boolean;
}

export class EvaSpecs {
  /** 当前阵营（决定读哪一列音轨名）。 */
  sideType: SideType;
  /** 对话 section 名 → EvaSpec。 */
  specs = new Map<string, EvaSpec>();

  constructor(sideType: SideType) {
    this.sideType = sideType;
    this.specs = new Map();
  }

  /**
   * 解析 eva.ini：读 [DialogList] 去重后的每个对话名，
   * 缺 section 时警告；返回 this 便于链式调用。
   */
  readIni(ini: any): this {
    const dialogList = ini.getSection("DialogList");
    if (!dialogList) throw new Error("Missing eva.ini [DialogList] section");
    const names = new Set<string>(dialogList.entries.values());
    const column = sideSoundColumn.get(this.sideType);
    if (!column) throw new Error(`Unhandled side type "${SideType[this.sideType]}"`);
    for (const name of names) {
      if (name) {
        const section = ini.getSection(name);
        if (section) {
          const spec: EvaSpec = {
            text: section.getString("Text"),
            sound: section.getString(column),
            priority: section.getEnum("Priority", EvaPriority, EvaPriority.Normal, true),
            queue: section.getString("Type").trim().toLowerCase() === "queue",
          };
          this.specs.set(name, spec);
        } else {
          console.warn(`Missing eva section [${name}]`);
        }
      }
    }
    return this;
  }

  /** 按对话名查询 EVA 定义。 */
  getSpec(name: string): EvaSpec | undefined {
    return this.specs.get(name);
  }
}
