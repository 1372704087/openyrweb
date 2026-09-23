/**
 * Serializer — gameopt 文本/二进制协议序列化器。
 *
 * 由 network/gameopt/Serializer.ts.js 重写为 TS（忠实翻译，行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 *
 * 关键语义（勿改）：
 * - serializeOptions 字段顺序、`6 - gameSpeed`、末尾 `:@:` 与 AI 尾逗号与孪生一致。
 * - serializeSlotData 对未识别 AI 难度 throw 消息与孪生一致。
 * - MAX_ACTION_PAYLOAD_SIZE = 65536 与越界 RangeError 消息与孪生一致。
 */

import { DataStream } from "data/DataStream"; // 孪生
import { SlotType } from "network/gameopt/SlotInfo"; // 孪生
import * as GameOptsModule from "game/gameopts/GameOpts"; // 孪生
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AiDifficulty: any = (GameOptsModule as any).AiDifficulty;
import { MapNameLegacyEncoder } from "network/gameopt/MapNameLegacyEncoder"; // 孪生
import { FileNameEncoder } from "network/gameopt/FileNameEncoder"; // 孪生
import { Base64 } from "util/Base64"; // 孪生
import { binaryStringToUint8Array, utf16ToBinaryString } from "util/string"; // 孪生
import type { AiOpts, ParsedGameOptions, PlayerActionPayload, SlotData } from "network/gameopt/Parser"; // 类型
import type { PingInfo } from "network/gameopt/PingInfo"; // 类型

/** LoadInfo 一行（serializeLoadInfo 字段形状）。 */
/** Replay 序列化所需的 gameopt 最窄形状（与 Parser.ParsedGameOptions 兼容）。 */
export type GameOptsLike = ParsedGameOptions;

export interface LoadInfoEntry {
  name: string;
  status: number;
  loadPercent: number;
  ping: number;
  lagAllowanceMillis: number;
}

/** gameopt 序列化器。 */
export class Serializer {
  /** 单包动作负载上限（孪生静态属性）。 */
  static MAX_ACTION_PAYLOAD_SIZE = 65536;

  /**
   * 序列化完整 gameopt 主串。
   * @param opts 已解析/组装的选项
   * @param useLegacyMapTitle true 时用 MapNameLegacyEncoder，否则 Base64
   * @returns `opts:players:@:ai,` 形状字符串
   */
  serializeOptions(opts: ParsedGameOptions, useLegacyMapTitle = false): string {
    const gameMode = opts.gameMode;
    const mapTitle = useLegacyMapTitle
      ? new MapNameLegacyEncoder().encode(opts.mapTitle)
      : Base64.encode(utf16ToBinaryString(opts.mapTitle));
    const mapName = new FileNameEncoder().encode(opts.mapName);
    const head = [
      "0",
      "0",
      6 - opts.gameSpeed,
      opts.credits,
      opts.unitCount,
      Number(opts.shortGame),
      Number(opts.superWeapons),
      Number(opts.buildOffAlly),
      Number(opts.mcvRepacks),
      Number(opts.cratesAppear),
      gameMode,
      Number(opts.hostTeams ?? false),
      mapTitle,
      opts.maxSlots,
      Number(opts.mapOfficial),
      opts.mapSizeBytes,
      mapName,
      opts.mapDigest,
      Number(opts.destroyableBridges),
      Number(opts.multiEngineer),
      Number(opts.noDogEngiKills),
      Number(opts.instantCapture),
      Number(opts.delayedOils),
      ...(opts.unknown ? [opts.unknown] : []),
    ].join(",");
    return (
      head +
      `:${opts.humanPlayers
        .map((p) => "" + p.name + `,${p.countryId},${p.colorId},${p.startPos},${p.teamId},0,0,0`)
        .join(",")}:@:${this.serializeAiOpts(opts.aiPlayers)},`
    );
  }

  /**
   * 序列化 AI 段（空槽写 `0,-1,-1,-1,-1`）。
   * @param ais AI 数组
   * @returns 逗号连接串
   */
  serializeAiOpts(ais: (AiOpts | undefined)[]): string {
    return ais
      .map((a) => (a ? `${a.difficulty},${a.countryId},${a.colorId},${a.startPos},` + a.teamId : "0,-1,-1,-1,-1"))
      .join(",");
  }

  /**
   * 序列化 ping 列表（首段为 count）。
   * @param pings 延迟列表
   */
  serializePingData(pings: PingInfo[]): string {
    return pings.length + "," + pings.map((p) => p.playerName + "," + p.ping).join(",");
  }

  /**
   * 序列化槽位串（末尾总带逗号）。
   * @param slots 槽位数组
   * @throws 未识别槽位/难度时抛 Error（消息与孪生一致）
   */
  serializeSlotData(slots: SlotData[]): string {
    return (
      slots
        .map((slot) => {
          if (slot.type === SlotType.Closed) return "@Closed@";
          if (slot.type === SlotType.Open) return "@Open@";
          if (slot.type === SlotType.OpenObserver) return "@OpenObserver@";
          if (slot.type === SlotType.Ai) {
            if (
              slot.difficulty === AiDifficulty.Easy ||
              slot.difficulty === AiDifficulty.Easy_Ori ||
              slot.difficulty === AiDifficulty.Easy_Custom
            )
              return "@EasyAI@";
            if (
              slot.difficulty === AiDifficulty.Medium ||
              slot.difficulty === AiDifficulty.Medium_Ori ||
              slot.difficulty === AiDifficulty.Medium_Custom
            )
              return "@MediumAI@";
            if (slot.difficulty === AiDifficulty.Brutal || slot.difficulty === AiDifficulty.Brutal_Ori)
              return "@HardAI@";
          } else if (slot.type === SlotType.Player) return slot.name;
          throw new Error("Unexpected slot info with type " + SlotType[slot.type]);
        })
        .join(",") + ","
    );
  }

  /**
   * 序列化 LoadInfo 列表（每行 name,status,loadPercent,ping,lagAllowance）。
   * @param rows LoadInfo 条目
   */
  serializeLoadInfo(rows: LoadInfoEntry[]): string {
    return rows.map((r) => [r.name, r.status, r.loadPercent, r.ping, r.lagAllowanceMillis].join(",")).join(",");
  }

  /**
   * 序列化单名玩家动作列表为二进制。
   * @param actions 动作负载数组
   * @returns Uint8Array
   * @throws 单包超 MAX_ACTION_PAYLOAD_SIZE 时 RangeError
   */
  serializePlayerActions(actions: PlayerActionPayload[]): Uint8Array {
    const stream = new DataStream();
    stream.writeUint8(actions.length);
    for (const { id, params } of actions) {
      stream.writeUint8(id);
      stream.writeUint16(params.byteLength);
      if (params.byteLength > 0) {
        if (params.byteLength > Serializer.MAX_ACTION_PAYLOAD_SIZE - stream.position) {
          console.error(`Action #${id} payload exceeds max data size`, params);
          throw new RangeError("Maximum payload data size exceeded");
        }
        stream.writeUint8Array(params);
      }
    }
    return stream.toUint8Array();
  }

  /**
   * 将「playerId → 动作列表」映射写入已有 DataStream。
   * @param stream 输出流
   * @param byPlayer 映射
   * @throws 单包超 MAX_ACTION_PAYLOAD_SIZE 时 RangeError
   */
  serializeAllPlayerActions(stream: DataStream, byPlayer: Map<number, PlayerActionPayload[]>): void {
    stream.writeUint8(byPlayer.size);
    for (const [playerId, actions] of byPlayer) {
      stream.writeUint8(playerId);
      const payload = this.serializePlayerActions(actions);
      stream.writeUint16(payload.byteLength);
      if (payload.byteLength > 0) {
        if (payload.byteLength > Serializer.MAX_ACTION_PAYLOAD_SIZE) {
          console.error(`Player #${playerId} actions payload exceeds max data size`, actions);
          throw new RangeError("Maximum payload data size exceeded");
        }
        stream.writeUint8Array(payload);
      }
    }
  }

  /**
   * binary string → 地图字节。
   * @param data binary string
   * @returns Uint8Array
   */
  serializeMapData(data: string): Uint8Array {
    return binaryStringToUint8Array(data);
  }
}
