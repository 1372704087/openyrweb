/**
 * TagsReader — 从地图条目批量解析标签(Tag)记录。
 *
 * 由 data/map/tag/TagsReader.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的
 * 编译产物。
 *
 * 用途：读取 INI/条目集合中形如 `Id=RepeatType,Name,TriggerId` 的标签行；
 * 非法格式或非法 RepeatType 只 console.warn 并跳过（不抛错），与孪生一致。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TagRepeatType } from "data/map/tag/TagRepeatType"; // 孪生

/** 解析成功的单条标签记录。 */
export interface TagRecord {
  /** 标签字符串 ID（条目 key）。 */
  id: string;
  /** 重复触发模式（0/1/2，见 TagRepeatType）。 */
  repeatType: number;
  /** 显示名（第二段）。 */
  name: string;
  /** 绑定的触发器 ID（第三段，保持字符串与孪生一致）。 */
  triggerId: string;
}

/** 可被 read() 消费的条目集合形状（与孪生 entries 迭代一致）。 */
export interface TagEntriesSource {
  entries: Iterable<[string, any]>;
}

/** 地图标签解析器。 */
export class TagsReader {
  /**
   * 解析条目集合中的全部标签。
   *
   * @param source 含 entries 的源（每项为 [id, rawValue]）。
   * @returns 合法标签数组；非法行跳过并告警。
   */
  read(source: TagEntriesSource): TagRecord[] {
    const result: TagRecord[] = [];
    for (const [id, raw] of source.entries) {
      const parts = String(raw).split(",");
      if (parts.length < 3) {
        console.warn(`Invalid tag ${id}=${raw}. Skipping.`);
        continue;
      }
      const repeatType = Number(parts[0]);
      if (void 0 !== (TagRepeatType as any)[repeatType]) {
        result.push({ id, repeatType, name: parts[1], triggerId: parts[2] });
      } else {
        console.warn(`Invalid repeat value ${repeatType} for tag id ${id}. Skipping.`);
      }
    }
    return result;
  }
}
