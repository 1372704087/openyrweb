/**
 * PagedResponse — 天梯分页响应通用类型（类型导出；孪生 execute 为空）。
 *
 * 由 network/ladder/PagedResponse.ts.js 重写为 TS。孪生为 SystemJS 空 execute，
 * 说明原 TS 仅导出类型/接口（编译后被擦除）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：运行时无本模块导出值——与孪生一致。
 * 字段形状与 LadderScreen 消费 rungSearch/listSearch 结果一致
 * （.players.totalCount / .players.records / .start / .head）。
 */

/** 分页后的记录集（rungSearch 返回值 / list 响应中的 players 段）。 */
export interface PagedResponse<T = unknown> {
  /** 本页记录。 */
  records: T[];
  /** 总记录数（用于翻页判断）。 */
  totalCount: number;
  /** 其余协议字段（宽松索引，避免过度收窄）。 */
  [key: string]: unknown;
}
