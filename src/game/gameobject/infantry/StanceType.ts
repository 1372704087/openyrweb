/**
 * StanceType — 步兵姿态。
 *
 * 由 game/gameobject/infantry/StanceType.ts.js 重写为 TS（行为完全一致，枚举值脚本提取自原文件）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export enum StanceType {
  /** 无（站立） */
  None = 0,
  /** 警戒 */
  Guard = 1,
  /** 卧倒（受压制时） */
  Prone = 2,
  /** 部署（如机枪兵架枪） */
  Deployed = 3,
  /** 空降中 */
  Paradrop = 4,
  /** 欢呼 */
  Cheer = 5,
}
