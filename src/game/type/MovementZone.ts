/**
 * MovementZone — 寻路移动域：决定单位能走哪些地形组合（寻路分区键）。
 *
 * 由 game/type/MovementZone.ts.js 重写为 TS（行为完全一致，枚举值脚本提取自原文件）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export enum MovementZone {
  /** 两栖 */
  Amphibious = 0,
  /** 两栖+可碾压 */
  AmphibiousCrusher = 1,
  /** 两栖+可摧毁地形 */
  AmphibiousDestroyer = 2,
  /** 可碾压 */
  Crusher = 3,
  /** 可碾压一切 */
  CrusherAll = 4,
  /** 可摧毁地形 */
  Destroyer = 5,
  /** 飞行 */
  Fly = 6,
  /** 步兵 */
  Infantry = 7,
  /** 步兵+可摧毁地形 */
  InfantryDestroyer = 8,
  /** 常规地面 */
  Normal = 9,
  /** 地下 */
  Subterranean = 10,
  /** 水域 */
  Water = 11,
}
