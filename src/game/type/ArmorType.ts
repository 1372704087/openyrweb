/**
 * ArmorType — 装甲类型（弹头威力表 Warhead 的查表维度）。
 *
 * 由 game/type/ArmorType.ts.js 重写为 TS（行为完全一致，枚举值脚本提取自原文件）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export enum ArmorType {
  /** 无 */
  None = 0,
  /** 步枪甲 */
  Flak = 1,
  /** 板甲 */
  Plate = 2,
  /** 轻甲 */
  Light = 3,
  /** 中甲 */
  Medium = 4,
  /** 重甲 */
  Heavy = 5,
  /** 木甲 */
  Wood = 6,
  /** 钢甲 */
  Steel = 7,
  /** 混凝土甲 */
  Concrete = 8,
  /** 特殊甲 1 */
  Special_1 = 9,
  /** 特殊甲 2 */
  Special_2 = 10,
}
