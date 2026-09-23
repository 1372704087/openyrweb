/**
 * SequenceReader — 读取 art.ini 中的 Sequence 节 → Map<SequenceType, 帧描述>。
 *
 * 每条值形如 "start, count, facingMult[, onlyFacing]"；onlyFacing 为
 * E/S/W/N 方向字母，映射到对应 facing 数。未知键名（不在 SequenceType 中）
 * 会被跳过。
 *
 * 由 game/art/SequenceReader.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 */
import { SequenceType } from "game/art/SequenceType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 方向字母 → facing 数（与孪生模块级 Map 一致）。 */
const onlyFacingMap = new Map<string, number>([
  ["E", 5],
  ["S", 3],
  ["W", 1],
  ["N", 7],
]);

/** 单条序列描述。 */
export interface SequenceDef {
  type: SequenceType;
  startFrame: number;
  frameCount: number;
  facingMult: number;
  onlyFacing?: number;
}

/** 序列解析器。 */
export class SequenceReader {
  /**
   * 解析一个 INI 节的全部序列项。
   * @param section - 含 entries: Map 的 art 序列节
   * @returns key=SequenceType 数值 的 Map（同键后者覆盖前者，与孪生 set 一致）
   */
  readIni(section: any): Map<any, SequenceDef> {
    const out = new Map<any, SequenceDef>();
    for (let [key, value] of section.entries) {
      const type = SequenceType[key as keyof typeof SequenceType];
      if (type !== undefined) {
        const parts = String(value).split(",");
        const def: SequenceDef = {
          type: type as SequenceType,
          startFrame: Number(parts[0]),
          frameCount: Number(parts[1]),
          facingMult: Number(parts[2]),
          onlyFacing: parts[3] ? onlyFacingMap.get(parts[3]) : void 0,
        };
        out.set(type, def);
      }
    }
    return out;
  }
}
