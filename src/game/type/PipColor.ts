/**
 * PipColor — 对象头顶 pip 标记的颜色。
 *
 * 由 game/type/PipColor.ts.js 重写为 TS（行为完全一致，枚举值脚本提取自原文件）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export enum PipColor {
  /** 绿色 */
  Green = 0,
  /** 黄色 */
  Yellow = 1,
  /** 白色 */
  White = 2,
  /** 红色 */
  Red = 3,
  /** 蓝色 */
  Blue = 4,
}
