/**
 * PartyState — 快速游戏组队状态枚举（字符串值）。
 *
 * 注意：模块名 PartyState，导出枚举名 PartyStatus（孪生如此）。
 *
 * 由 gui/screen/mainMenu/quickGame/PartyState.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */

/** 组队状态。 */
export enum PartyStatus {
  /** 空闲。 */
  Idle = "idle",
  /** 排队中。 */
  Queued = "queued",
}
