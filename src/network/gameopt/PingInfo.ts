/**
 * PingInfo — 单名玩家延迟信息（类型导出；孪生 execute 为空）。
 *
 * 由 network/gameopt/PingInfo.ts.js 重写为 TS。孪生为 SystemJS 空 execute，
 * 说明原 TS 仅导出类型/接口（编译后被擦除）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 字段形状与 gameopt/Parser.parsePingData 返回项一致（孪生逐字段构造
 * { playerName, ping }）。
 */

/** 一名玩家的延迟记录。 */
export interface PingInfo {
  /** 玩家名。 */
  playerName: string;
  /** 延迟数值（gameopt 协议原样，单位由调用方解释）。 */
  ping: number;
}
