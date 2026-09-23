/**
 * TauntReplayEvent — 回放中的挑衅（taunt）事件。
 *
 * 由 network/gamestate/replay/TauntReplayEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 *
 * 关键语义（勿改）：serialize/unserialize 的 `playerId:tauntNo` 文本形状与孪生一致。
 */

import { ReplayEvent } from "network/gamestate/replay/ReplayEvent"; // 孪生
import { ReplayEventType } from "network/gamestate/replay/ReplayEventType"; // 孪生

/** 挑衅事件负载。 */
export interface TauntPayload {
  /** 发出挑衅的玩家 id。 */
  playerId: number;
  /** 挑衅编号。 */
  tauntNo: number;
}

/** 挑衅回放事件。 */
export class TauntReplayEvent extends ReplayEvent {
  declare payload: TauntPayload;

  /**
   * @param tickNo 事件所在 tick
   */
  constructor(tickNo: number) {
    super(ReplayEventType.Taunt, tickNo);
  }

  /** 序列化为 `playerId:tauntNo`。 */
  serialize(): string {
    return this.payload.playerId + ":" + this.payload.tauntNo;
  }

  /**
   * 从 `playerId:tauntNo` 反序列化到 payload。
   * @param data 序列化文本
   */
  unserialize(data: string): void {
    const [pid, no] = data.split(":");
    const playerId = Number(pid);
    const tauntNo = Number(no);
    this.payload = { playerId, tauntNo };
  }
}
