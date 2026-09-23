/**
 * SlotInfo — 游戏房间槽位类型枚举 SlotType（数值 0..4）。
 *
 * 由 network/gameopt/SlotInfo.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的
 * 编译产物。
 *
 * 关键语义（勿改）：数值与反向映射名称字符串与孪生逐项一致。
 * 本模块原先仅导出枚举（无其它运行时导出）。
 */

/** 槽位类型。 */
export enum SlotType {
  /** 关闭槽位。 */
  Closed = 0,
  /** 开放槽位（玩家可加入）。 */
  Open = 1,
  /** 开放观察者槽位。 */
  OpenObserver = 2,
  /** 玩家槽位。 */
  Player = 3,
  /** AI 槽位。 */
  Ai = 4,
}
