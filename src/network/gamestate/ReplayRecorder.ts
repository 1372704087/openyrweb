/**
 * ReplayRecorder — 将回合动作/聊天/挑衅写入 Replay 的录制器。
 *
 * 由 network/gamestate/ReplayRecorder.ts.js 重写为 TS（行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 *
 * 关键语义（勿改）：
 * - recordActions 接受单玩家数组或 Map 玩家→动作列表；无实质动作时跳过。
 * - 聊天/挑衅通过 humanPlayers 按 name 反查 playerId 下标。
 * - 仅当存在 id !== ActionType.NoAction 的动作才算 hasActualActions。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

import { ActionType } from "game/action/ActionType"; // 孪生
import { TurnActionsReplayEvent } from "network/gamestate/replay/TurnActionsReplayEvent"; // 孪生
import { Parser } from "network/gameopt/Parser"; // 孪生
import { Serializer } from "network/gameopt/Serializer"; // 孪生
import { ChatMessageReplayEvent } from "network/gamestate/replay/ChatMessageReplayEvent"; // 孪生
import { TauntReplayEvent } from "network/gamestate/replay/TauntReplayEvent"; // 孪生
import type { Replay } from "network/gamestate/Replay"; // 孪生

/** 动作序列化器最小接口（对应 actionSerializer）。 */
export interface ReplayActionSerializer {
  /** 将动作对象转为可序列化载荷。 */
  getActionPayload(action: unknown): { id: number; params?: unknown };
}

/** 回合动作 Map：玩家 id → 动作数组。 */
export type TurnActionsMap = Map<number, Array<{ id: number; params?: unknown }>>;

/** 人类玩家最小接口（按 name 匹配）。 */
export interface ReplayHumanPlayer {
  /** 玩家名。 */
  name: string;
}

/** 回放录制器。 */
export class ReplayRecorder {
  /**
   * @param replay 目标回放。
   * @param playerId 本机玩家 id。
   * @param humanPlayers 人类玩家列表（用于 name→index）。
   * @param actionSerializer 动作序列化器。
   */
  constructor(
    private replay: Replay,
    private playerId: number,
    private humanPlayers: ReplayHumanPlayer[],
    private actionSerializer: ReplayActionSerializer,
  ) {}

  /**
   * 记录本回合动作。
   * @param tickNo 所属 tick。
   * @param actions 单玩家动作数组，或 玩家 id→动作数组 的 Map。
   */
  recordActions(tickNo: number, actions: Array<{ id: number; params?: unknown }> | TurnActionsMap): void {
    if (Array.isArray(actions)) {
      const event = new TurnActionsReplayEvent(new Parser(), new Serializer(), tickNo);
      event.payload = [[this.playerId, actions.map((a) => this.actionSerializer.getActionPayload(a))]];
      this.replay.writeEvent(event);
    } else if (this.hasActualActions(actions)) {
      const event = new TurnActionsReplayEvent(new Parser(), new Serializer(), tickNo);
      event.payload = [...actions].map(
        ([playerId, list]) => [playerId, list] as [number, Array<{ id: number; params?: unknown }>],
      );
      this.replay.writeEvent(event);
    }
  }

  /**
   * 记录聊天消息（按 sender 名反查 player 下标）。
   * @param tickNo 所属 tick。
   * @param senderName 发送者名。
   * @param message 消息正文。
   */
  recordChatMessage(tickNo: number, senderName: string, message: string): void {
    const event = new ChatMessageReplayEvent(tickNo);
    event.payload = {
      playerId: this.humanPlayers.findIndex((p) => p.name === senderName),
      message,
    };
    this.replay.writeEvent(event);
  }

  /**
   * 记录挑衅（按 sender 名反查 player 下标）。
   * @param tickNo 所属 tick。
   * @param senderName 发送者名。
   * @param tauntNo 挑衅编号。
   */
  recordTaunt(tickNo: number, senderName: string, tauntNo: number): void {
    const event = new TauntReplayEvent(tickNo);
    event.payload = {
      playerId: this.humanPlayers.findIndex((p) => p.name === senderName),
      tauntNo,
    };
    this.replay.writeEvent(event);
  }

  /**
   * Map 中是否至少有一名玩家存在非 NoAction 动作。
   * @param actions 玩家 id→动作数组。
   */
  private hasActualActions(actions: TurnActionsMap): boolean {
    return !![...actions.values()].find((list) => list.find((a) => a.id !== ActionType.NoAction));
  }
}
