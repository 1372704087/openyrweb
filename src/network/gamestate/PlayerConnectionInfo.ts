/**
 * PlayerConnectionInfo — 玩家连接详情类型（类型导出；孪生 execute 为空）。
 *
 * 由 network/gamestate/PlayerConnectionInfo.ts.js 重写为 TS。孪生为 SystemJS
 * 空 execute，说明原 TS 仅导出类型/接口（编译后被擦除）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：运行时无本模块导出值——与孪生一致。
 * 字段按 gamestate 连接上下文宽松标注（原名已 minify）。
 */

/** 玩家连接详情。 */
export interface PlayerConnectionInfo {
  /** 玩家 id。 */
  playerId?: number;
  /** 玩家名。 */
  playerName?: string;
  /** 是否已连接。 */
  connected?: boolean;
  /** 最近活动时间戳（ms）。 */
  lastSeenMillis?: number;
  /** 往返延迟（ms）。 */
  pingMillis?: number;
  /** 允许滞后余量（ms）。 */
  lagAllowanceMillis?: number;
  /** 其余协议字段（宽松索引，避免过度收窄）。 */
  [key: string]: unknown;
}
