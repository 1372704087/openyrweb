/**
 * ActionSerializer — 将 Action 实例压成 PlayerActionPayload。
 *
 * 由 network/gamestate/ActionSerializer.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 *
 * 关键语义（勿改）：
 * - getActionPayload 返回 { id: action.actionType, params: action.serialize() }。
 * - 调用方：LockstepManager.sendActions / ReplayRecorder.recordActions。
 * - 本模块无依赖（孪生 deps: []）。
 */

import type { PlayerActionPayload } from "network/gamestate/PlayerActionPayload"; // 已转换

/** 可序列化的动作（结构约束，避免依赖 game/action 运行时）。 */
export interface SerializableAction {
  /** 动作类型 id。 */
  actionType: number;
  /** 序列化为字节参数。 */
  serialize(): Uint8Array;
}

/** 动作 → 载荷转换器。 */
export class ActionSerializer {
  /** 把动作实例压成可上网/可落盘的 { id, params }。 */
  getActionPayload(action: SerializableAction): PlayerActionPayload {
    return { id: action.actionType, params: action.serialize() };
  }
}
