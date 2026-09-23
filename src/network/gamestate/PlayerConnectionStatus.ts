/**
 * PlayerConnectionStatus — 玩家连接状态枚举。
 *
 * 由 network/gamestate/PlayerConnectionStatus.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 *
 * 关键语义（勿改）：数值与反向映射名称字符串与孪生逐项一致。
 */

/** 玩家连接状态。 */
export enum PlayerConnectionStatus {
  /** 未连接。 */
  NotConnected = 0,
  /** 已连接。 */
  Connected = 1,
}
