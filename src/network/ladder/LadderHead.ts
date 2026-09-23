/**
 * LadderHead — 天梯赛季/表头元数据类型（类型导出；孪生 execute 为空）。
 *
 * 由 network/ladder/LadderHead.ts.js 重写为 TS。孪生为 SystemJS 空 execute，
 * 说明原 TS 仅导出类型/接口（编译后被擦除）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：运行时无本模块导出值——与孪生一致。
 * 字段形状由 ladder 赛季/列表接口响应上下文宽松标注（原名已 minify）。
 */

/** 天梯赛季/表头元数据。 */
export interface LadderHead {
  /** 赛季 id。 */
  seasonId?: number;
  /** 赛季显示名。 */
  name?: string;
  /** 是否为当前赛季。 */
  current?: boolean;
  /** 开始时间戳（协议原样）。 */
  startTime?: number;
  /** 结束时间戳（协议原样）。 */
  endTime?: number;
  /** 玩家总数。 */
  totalPlayers?: number;
  /** 其余协议字段（宽松索引，避免过度收窄）。 */
  [key: string]: unknown;
}
