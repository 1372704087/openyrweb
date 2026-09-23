/**
 * ReplayEventFactory — 按 ReplayEventType 构造对应回放事件实例。
 *
 * 由 network/gamestate/replay/ReplayEventFactory.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 *
 * 关键语义（勿改）：
 * - 构造注入 gameOptsParser / gameOptsSerializer（供 TurnActions 使用）。
 * - create(type, tickNo)：
 *   TurnActions → new TurnActionsReplayEvent(parser, serializer, tickNo)
 *   ChatMessage → new ChatMessageReplayEvent(tickNo)
 *   Taunt       → new TauntReplayEvent(tickNo)
 *   其它 type 抛 `Unsupported replay event type "${e}" at game tick "${t}"`。
 */

import { ChatMessageReplayEvent } from "network/gamestate/replay/ChatMessageReplayEvent"; // 已转换
import { ReplayEventType } from "network/gamestate/replay/ReplayEventType"; // 已转换
import { TauntReplayEvent } from "network/gamestate/replay/TauntReplayEvent"; // 已转换
import { TurnActionsReplayEvent } from "network/gamestate/replay/TurnActionsReplayEvent"; // 已转换
import type { Parser } from "network/gameopt/Parser"; // 已转换
import type { Serializer } from "network/gameopt/Serializer"; // 已转换
import type { ReplayEvent } from "network/gamestate/replay/ReplayEvent"; // 已转换

/** 回放事件工厂。 */
export class ReplayEventFactory {
  /** gameopt 解析器（TurnActions 反序列化用）。 */
  gameOptsParser: Parser;
  /** gameopt 序列化器（TurnActions 序列化用）。 */
  gameOptsSerializer: Serializer;

  constructor(gameOptsParser: Parser, gameOptsSerializer: Serializer) {
    this.gameOptsParser = gameOptsParser;
    this.gameOptsSerializer = gameOptsSerializer;
  }

  /** 按类型 + tick 构造事件实例。 */
  create(type: ReplayEventType, tickNo: number): ReplayEvent {
    switch (type) {
      case ReplayEventType.TurnActions:
        return new TurnActionsReplayEvent(this.gameOptsParser, this.gameOptsSerializer, tickNo);
      case ReplayEventType.ChatMessage:
        return new ChatMessageReplayEvent(tickNo);
      case ReplayEventType.Taunt:
        return new TauntReplayEvent(tickNo);
      default:
        throw new Error(`Unsupported replay event type "${type}" at game tick "${tickNo}"`);
    }
  }
}
