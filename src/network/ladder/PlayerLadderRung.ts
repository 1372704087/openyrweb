/**
 * PlayerLadderRung — 天梯台阶/段位条目类型（类型导出；孪生 execute 为空）。
 *
 * 由 network/ladder/PlayerLadderRung.ts.js 重写为 TS。孪生为 SystemJS
 * 空 execute，说明原 TS 仅导出类型/接口（编译后被擦除）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：运行时无本模块导出值——与孪生一致。
 * 字段按 ladder 列表条目上下文宽松标注（原名已 minify）。
 */

/** 天梯列表中的一行（台阶条目）。 */
export interface PlayerLadderRung {
  /** 名次（1 起或协议原样）。 */
  rank?: number;
  /** 玩家名。 */
  name?: string;
  /** 积分/分数。 */
  score?: number;
  /** 胜场。 */
  wins?: number;
  /** 负场。 */
  losses?: number;
  /** 军衔（可与 PlayerRankType 数值对应）。 */
  rankType?: number;
  /** 其余协议字段（宽松索引，避免过度收窄）。 */
  [key: string]: unknown;
}
