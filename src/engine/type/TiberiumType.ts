/**
 * TiberiumType — 矿石类型（Riparius 为主矿石，其余为扩展；Ore/Gems 为 Harvest 分账维度）。
 *
 * 由 engine/type/TiberiumType.ts.js 重写为 TS（行为完全一致，枚举值脚本提取自原文件）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export enum TiberiumType {
  /** 主矿石（Riparius） */
  Riparius = 0,
  /** 矿石（通用） */
  Ore = 0,
  /** Cruentus 矿 */
  Cruentus = 1,
  /** 宝石 */
  Gems = 1,
  /** Vinifera 矿 */
  Vinifera = 2,
  /** 矿石 2 */
  Ore2 = 2,
  /** Aboreus 矿 */
  Aboreus = 3,
  /** 矿石 3 */
  Ore3 = 3,
}
