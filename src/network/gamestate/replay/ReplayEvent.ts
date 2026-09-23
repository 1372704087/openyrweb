/**
 * ReplayEvent — 回放事件基类（type/tickNo 字段；子类实现序列化）。
 *
 * 由 network/gamestate/replay/ReplayEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 关键语义（勿改）：
 * - 构造为 (type, tickNo)；本基类不提供 serialize/unserialize。
 * - 子类（ChatMessage/Taunt/TurnActions）各自实现序列化方法。
 */

import { ReplayEventType } from "network/gamestate/replay/ReplayEventType"; // 孪生

/** 回放事件基类。 */
export class ReplayEvent {
  /** 事件类型。 */
  readonly type: ReplayEventType;
  /** 所属游戏 tick。 */
  readonly tickNo: number;
  /** 事件载荷（由子类定义形状）。 */
  payload?: unknown;

  /**
   * @param type 事件类型。
   * @param tickNo 所属 tick。
   */
  constructor(type: ReplayEventType, tickNo: number) {
    this.type = type;
    this.tickNo = tickNo;
  }
}
