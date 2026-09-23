/**
 * PlayerMatchHistoryEntry — 天梯对战历史条目类型（类型导出；孪生 execute 为空）。
 *
 * 由 network/ladder/PlayerMatchHistoryEntry.ts.js 重写为 TS。孪生为 SystemJS
 * 空 execute，说明原 TS 仅导出类型/接口（编译后被擦除）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：运行时无本模块导出值——与孪生一致。
 * 字段按 ladder 历史列表上下文宽松标注（原名已 minify）。
 */

/** 天梯对战历史一行。 */
export interface PlayerMatchHistoryEntry {
  /** 对局/场次 id。 */
  matchId?: string;
  /** 开始时间戳（协议原样）。 */
  startTime?: number;
  /** 结束时间戳（协议原样）。 */
  endTime?: number;
  /** 对手名。 */
  opponent?: string;
  /** 是否获胜。 */
  won?: boolean;
  /** 本方得分变化。 */
  scoreDelta?: number;
  /** 变化后积分。 */
  score?: number;
  /** 天梯类型（LadderType 字符串值）。 */
  ladderType?: string;
  /** 赛季标识。 */
  season?: string;
  /** 其余协议字段（宽松索引，避免过度收窄）。 */
  [key: string]: unknown;
}
