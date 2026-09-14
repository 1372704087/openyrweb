/**
 * VeteranLevel — 单位经验等级（普通/老兵/精英，由击杀经验累积晋升）。
 *
 * 由 game/gameobject/unit/VeteranLevel.ts.js 重写为 TS（行为完全一致，枚举值脚本提取自原文件）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export enum VeteranLevel {
  /** 普通 */
  None = 0,
  /** 老兵（一阶晋升） */
  Veteran = 1,
  /** 精英（二阶晋升） */
  Elite = 2,
}
