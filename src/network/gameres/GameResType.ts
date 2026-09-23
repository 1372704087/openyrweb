/**
 * GameResType — 战报完成状态位标志。
 *
 * 由 network/gameres/GameResType.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的
 * 编译产物。
 *
 * 关键语义（勿改）：数值与反向映射名称字符串与孪生逐项一致（含 Resign=528、Disconnect=768）。
 */

/** 战报完成状态。 */
export enum GameResType {
  /** 连接丢失。 */
  ConnectionLost = 2,
  /** 仍在进行。 */
  Playing = 8,
  /** 平局。 */
  Draw = 64,
  /** 胜利。 */
  Win = 256,
  /** 失败。 */
  Loss = 512,
  /** 认输（孪生原样 528）。 */
  Resign = 528,
  /** 断开（孪生原样 768）。 */
  Disconnect = 768,
}
