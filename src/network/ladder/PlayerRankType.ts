/**
 * PlayerRankType — 天梯军衔等级枚举（数值 0..10）。
 *
 * 由 network/ladder/PlayerRankType.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的
 * 编译产物。
 *
 * 关键语义（勿改）：数值与反向映射名称字符串与孪生逐项一致。
 */

/** 无军衔。 */
export enum PlayerRankType {
  None = 0,
  /** 列兵。 */
  Private = 1,
  /** 下士。 */
  Corporal = 2,
  /** 中士。 */
  Sergeant = 3,
  /** 中尉。 */
  Lieutenant = 4,
  /** 少校。 */
  Major = 5,
  /** 上校。 */
  Colonel = 6,
  /** 准将。 */
  BrigGeneral = 7,
  /** 将军。 */
  General = 8,
  /** 五星上将。 */
  FiveStarGeneral = 9,
  /** 总司令。 */
  CommanderInChief = 10,
}
