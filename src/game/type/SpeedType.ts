/**
 * SpeedType — 移动速度类型（Speed 解析结果，决定寻路与可通行地形）。
 *
 * 由 game/type/SpeedType.ts.js 重写为 TS（行为完全一致，枚举值脚本提取自原文件）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export enum SpeedType {
  /** 步兵双腿 */
  Foot = 0,
  /** 履带 */
  Track = 1,
  /** 轮胎 */
  Wheel = 2,
  /** 悬浮 */
  Hover = 3,
  /** 水面漂浮（船） */
  Float = 4,
  /** 滩涂漂浮 */
  FloatBeach = 5,
  /** 两栖 */
  Amphibious = 6,
  /** 飞行 */
  Winged = 7,
}
