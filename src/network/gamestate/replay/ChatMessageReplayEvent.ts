/**
 * ChatMessageReplayEvent — 回放中的聊天消息事件。
 *
 * 由 network/gamestate/replay/ChatMessageReplayEvent.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：
 * - 序列化格式：`playerId:Base64(utf16ToBinaryString(message))`。
 * - unserialize 按第一个 `:` 分割；payload 为 { playerId, message }。
 */

import { Base64 } from "util/Base64"; // 孪生
import { binaryStringToUtf16, utf16ToBinaryString } from "util/string"; // 孪生
import { ReplayEvent } from "network/gamestate/replay/ReplayEvent"; // 孪生
import { ReplayEventType } from "network/gamestate/replay/ReplayEventType"; // 孪生

/** 聊天消息事件载荷。 */
export interface ChatMessageReplayPayload {
  /** 玩家索引（在 humanPlayers 中的下标）。 */
  playerId: number;
  /** 消息正文。 */
  message: string;
}

/** 回放中的聊天消息事件。 */
export class ChatMessageReplayEvent extends ReplayEvent {
  /** 聊天消息载荷。 */
  declare payload: ChatMessageReplayPayload;

  /**
   * @param tickNo 所属 tick。
   */
  constructor(tickNo: number) {
    super(ReplayEventType.ChatMessage, tickNo);
  }

  /** 序列化为 `playerId:base64(utf16)` 文本。 */
  serialize(): string {
    return this.payload.playerId + ":" + Base64.encode(utf16ToBinaryString(this.payload.message));
  }

  /**
   * 从 `playerId:base64(utf16)` 文本反序列化。
   * @param data 序列化文本。
   */
  unserialize(data: string): void {
    const [idStr, b64] = data.split(":");
    const playerId = Number(idStr);
    const message = binaryStringToUtf16(Base64.decode(b64));
    this.payload = { playerId, message };
  }
}
