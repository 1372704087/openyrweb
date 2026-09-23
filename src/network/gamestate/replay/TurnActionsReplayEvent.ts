/**
 * TurnActionsReplayEvent — 回放中的「回合动作」事件（序列化为 Base64）。
 *
 * 由 network/gamestate/replay/TurnActionsReplayEvent.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 关键语义（勿改）：
 * - 继承 ReplayEvent，type 固定为 ReplayEventType.TurnActions。
 * - 构造 (gameOptsParser, gameOptsSerializer, tickNo)。
 * - serialize()：新建 DataStream → serializeAllPlayerActions(stream, Map(payload))
 *   → uint8ArrayToBase64String。
 * - unserialize(s)：DataStream(base64StringToUint8Array) → parseAllPlayerActions
 *   → 展开为 [...map] 写回 this.payload。
 * - payload 形状：[playerId, PlayerActionPayload[]][]（与 ReplayRecorder 写入一致）。
 */

import { DataStream } from "data/DataStream"; // 已转换
import { uint8ArrayToBase64String, base64StringToUint8Array } from "util/string"; // 已转换
import { ReplayEvent } from "network/gamestate/replay/ReplayEvent"; // 已转换
import { ReplayEventType } from "network/gamestate/replay/ReplayEventType"; // 已转换
import type { Parser } from "network/gameopt/Parser"; // 已转换
import type { Serializer } from "network/gameopt/Serializer"; // 已转换
import type { PlayerActionPayload } from "network/gamestate/PlayerActionPayload"; // 已转换

/** 单名玩家的动作列表。 */
export type PlayerActionsEntry = [playerId: number, actions: PlayerActionPayload[]];

/** 回合动作回放事件。 */
export class TurnActionsReplayEvent extends ReplayEvent {
  /** gameopt 解析器。 */
  gameOptsParser: Parser;
  /** gameopt 序列化器。 */
  gameOptsSerializer: Serializer;

  constructor(gameOptsParser: Parser, gameOptsSerializer: Serializer, tickNo: number) {
    super(ReplayEventType.TurnActions, tickNo);
    this.gameOptsParser = gameOptsParser;
    this.gameOptsSerializer = gameOptsSerializer;
  }

  /** 序列化为 Base64（DataStream → serializeAllPlayerActions）。 */
  serialize(): string {
    const stream = new DataStream();
    this.gameOptsSerializer.serializeAllPlayerActions(stream, new Map(this.payload as PlayerActionsEntry[]));
    return uint8ArrayToBase64String(stream.toUint8Array());
  }

  /** 从 Base64 还原 payload（Map 条目展开为数组）。 */
  unserialize(data: string): void {
    const bytes = base64StringToUint8Array(data);
    const stream = new DataStream(
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
    );
    const map = this.gameOptsParser.parseAllPlayerActions(stream);
    this.payload = [...map];
  }
}
