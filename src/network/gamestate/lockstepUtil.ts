/**
 * lockstepUtil — 锁步网络回合时长计算工具。
 *
 * 由 network/gamestate/lockstepUtil.ts.js 重写为 TS（行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 *
 * 关键语义（勿改）：`max(1, ceil(desired/gameTurn)) * gameTurn` 与孪生一致。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/**
 * 由期望网络回合时长与游戏帧时长计算实际网络回合时长（对齐到整数游戏帧）。
 * @param desiredMillis 期望网络回合毫秒数（服务器 rate）
 * @param gameTurnMillis 单次 game turn 毫秒数
 * @returns 向上取整到 gameTurn 倍数后的网络回合毫秒数（至少 1 个 game turn）
 */
export function computeNetworkTurnMillis(desiredMillis: number, gameTurnMillis: number): number {
  return Math.max(1, Math.ceil(desiredMillis / gameTurnMillis)) * gameTurnMillis;
}
