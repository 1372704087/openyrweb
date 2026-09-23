/**
 * ReplayEventType — 回放事件类型枚举（数值 0..2）。
 *
 * 由 network/gamestate/replay/ReplayEventType.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 关键语义（勿改）：数值与反向映射名称字符串与孪生逐项一致。
 * 回放文件事件行中的 type 字段使用本数值。
 */

/** 回放事件类型。 */
export enum ReplayEventType {
  /** 回合玩家动作序列。 */
  TurnActions = 0,
  /** 聊天消息。 */
  ChatMessage = 1,
  /** 挑衅（taunt）。 */
  Taunt = 2,
}
