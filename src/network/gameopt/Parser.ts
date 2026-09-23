/**
 * Parser — gameopt 文本/二进制协议解析器。
 *
 * 由 network/gameopt/Parser.ts.js 重写为 TS（忠实翻译，行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 *
 * 关键语义（勿改）：
 * - parseOptions 的字段顺序、`6 - speed`、缺省 `?? "1"`/`?? "0"` 与孪生一致。
 * - parseTopic 在段数 < 6 时返回 undefined（不 throw）。
 * - 玩家段长度 %8、AI 段 %5、ping 段 %2 校验消息与孪生一致。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

import { DataStream } from "data/DataStream"; // 孪生
import { MapNameLegacyEncoder } from "network/gameopt/MapNameLegacyEncoder"; // 孪生
import { SlotType } from "network/gameopt/SlotInfo"; // 孪生
import * as GameOptsModule from "game/gameopts/GameOpts"; // 孪生
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AiDifficulty: any = (GameOptsModule as any).AiDifficulty;
import { FileNameEncoder } from "network/gameopt/FileNameEncoder"; // 孪生
import { Base64 } from "util/Base64"; // 孪生
import { binaryStringToUtf16, uint8ArrayToBinaryString } from "util/string"; // 孪生
import type { WolGameTopic } from "network/gameopt/WolGameTopic"; // 类型
import type { PingInfo } from "network/gameopt/PingInfo"; // 类型

/** 一名人类玩家的 gameopt 字段。 */
export interface PlayerOpts {
  name: string;
  countryId: number;
  colorId: number;
  startPos: number;
  teamId: number;
}

/** 一名 AI 的 gameopt 字段。 */
export interface AiOpts {
  difficulty: number;
  countryId: number;
  colorId: number;
  startPos: number;
  teamId: number;
}

/** 槽位解析结果。 */
export interface SlotData {
  type: SlotType;
  name?: string;
  difficulty?: number;
}

/** 单条玩家动作负载。 */
export interface PlayerActionPayload {
  id: number;
  params: Uint8Array;
}

/** parseOptions 返回的 gameopt 主对象。 */
export interface ParsedGameOptions {
  gameSpeed: number;
  credits: number;
  unitCount: number;
  shortGame: boolean;
  superWeapons: boolean;
  buildOffAlly: boolean;
  mcvRepacks: boolean;
  cratesAppear: boolean;
  gameMode: number;
  hostTeams: boolean;
  mapTitle: string;
  maxSlots: number;
  mapOfficial: boolean;
  mapSizeBytes: number;
  mapName: string;
  mapDigest: string;
  destroyableBridges: boolean;
  multiEngineer: boolean;
  noDogEngiKills: boolean;
  instantCapture: boolean;
  delayedOils: boolean;
  unknown?: string;
  humanPlayers: PlayerOpts[];
  aiPlayers: (AiOpts | undefined)[];
}

/** gameopt 解析器。 */
export class Parser {
  /**
   * 解析完整 gameopt 主串（`opts:players:@:ai,` 形状）。
   * @param data 原始 gameopt 字符串
   * @returns 解析后的选项对象
   */
  parseOptions(data: string): ParsedGameOptions {
    const opts = {} as ParsedGameOptions;
    const [part0, part1, , part3] = data.split(":");
    const fields = part0.split(",");
    fields.shift();
    fields.shift();
    opts.gameSpeed = 6 - Number(fields.shift());
    opts.credits = Number(fields.shift());
    opts.unitCount = Number(fields.shift());
    opts.shortGame = Boolean(Number(fields.shift()));
    opts.superWeapons = Boolean(Number(fields.shift()));
    opts.buildOffAlly = Boolean(Number(fields.shift()));
    opts.mcvRepacks = Boolean(Number(fields.shift()));
    opts.cratesAppear = Boolean(Number(fields.shift()));
    opts.gameMode = Number(fields.shift());
    opts.hostTeams = Boolean(Number(fields.shift()));
    const mapTitleRaw = fields.shift();
    opts.mapTitle = Base64.isBase64(mapTitleRaw)
      ? binaryStringToUtf16(Base64.decode(mapTitleRaw))
      : new MapNameLegacyEncoder().decode(mapTitleRaw);
    opts.maxSlots = Number(fields.shift());
    opts.mapOfficial = Boolean(Number(fields.shift()));
    opts.mapSizeBytes = Number(fields.shift());
    opts.mapName = new FileNameEncoder().decode(fields.shift());
    opts.mapDigest = fields.shift();
    opts.destroyableBridges = Boolean(Number(fields.shift() ?? "1"));
    opts.multiEngineer = Boolean(Number(fields.shift() ?? "0"));
    opts.noDogEngiKills = Boolean(Number(fields.shift() ?? "0"));
    opts.instantCapture = Boolean(Number(fields.shift() ?? "1"));
    opts.delayedOils = Boolean(Number(fields.shift() ?? "0"));
    opts.unknown = fields.length ? fields.join(",") : undefined;
    opts.humanPlayers = this.parsePlayerOpts(part1);
    opts.aiPlayers = this.parseAiOpts(part3?.slice(0, -1));
    return opts;
  }

  /**
   * 解析人类玩家段（每 8 字段一名玩家）。
   * @param playersData 玩家段字符串
   * @throws 长度非 8 倍数时抛 Error
   */
  parsePlayerOpts(playersData: string): PlayerOpts[] {
    const parts = playersData.split(",");
    if (parts.length % 8 != 0) {
      throw new Error("Couldn't parse gameopt: unexpected players data length " + parts.length);
    }
    const list: PlayerOpts[] = [];
    const count = Math.floor(parts.length / 8);
    for (let i = 0; i < count; ++i) {
      list.push({
        name: parts[8 * i],
        countryId: Number(parts[8 * i + 1]),
        colorId: Number(parts[8 * i + 2]),
        startPos: Number(parts[8 * i + 3]),
        teamId: Number(parts[8 * i + 4]),
      });
    }
    return list;
  }

  /**
   * 解析 AI 段（每 5 字段一名 AI；countryId === -1 的空槽写入 undefined）。
   * @param aiData AI 段字符串（可为 undefined/空）
   * @throws 长度非 5 倍数时抛 Error
   */
  parseAiOpts(aiData?: string): (AiOpts | undefined)[] {
    const list: (AiOpts | undefined)[] = [];
    if (aiData) {
      const parts = aiData.split(",");
      if (parts.length % 5 != 0) throw new Error("Couldn't parse gameopt: unexpected ai data length " + parts.length);
      const count = Math.floor(parts.length / 5);
      for (let i = 0; i < count; ++i) {
        const a: AiOpts = {
          difficulty: Number(parts[5 * i]),
          countryId: Number(parts[5 * i + 1]),
          colorId: Number(parts[5 * i + 2]),
          startPos: Number(parts[5 * i + 3]),
          teamId: Number(parts[5 * i + 4]),
        };
        list.push(a.countryId !== -1 ? a : undefined);
      }
    }
    return list;
  }

  /**
   * 解析大厅 topic 字符串（逗号分隔，至少 6 段）。
   * @param data topic 字符串
   * @returns WolGameTopic；段数不足时返回 undefined
   */
  parseTopic(data: string): WolGameTopic | undefined {
    const parts = data.split(",");
    if (parts.length < 6) return;
    const first = parts[0];
    const modHash = Number(parts[1]);
    const maxPlayersChar = first[2];
    return {
      description: parts[6] ? binaryStringToUtf16(Base64.decode(parts[6])) : "",
      modHash,
      modName: parts[7] ? binaryStringToUtf16(Base64.decode(parts[7])) : undefined,
      aiPlayers: Number(parts[2]),
      maxPlayers: Number(maxPlayersChar),
      observers: Number(parts[3]),
      observable: Boolean(Number(parts[4])),
      mapName: new FileNameEncoder().decode(parts[5]),
    };
  }

  /**
   * 解析 ping 数据（首段跳过，其后 name,value 成对）。
   * @param data ping 字符串
   * @throws 长度为奇数时抛 Error
   */
  parsePingData(data: string): PingInfo[] {
    const parts = data.split(",").slice(1);
    if (parts.length % 2) throw new Error("Couldn't parse gameopt: unexpected ping data length " + parts.length);
    const list: PingInfo[] = [];
    const count = Math.floor(parts.length / 2);
    for (let i = 0; i < count; ++i) {
      list.push({ playerName: parts[2 * i], ping: Number(parts[2 * i + 1]) });
    }
    return list;
  }

  /**
   * 解析槽位串（去掉首尾字符后按逗号拆分）。
   * @param data 槽位原始串
   * @returns 槽位数组
   */
  parseSlotData(data: string): SlotData[] {
    const list: SlotData[] = [];
    for (const token of data.slice(1, -1).split(",")) {
      const slot = {} as SlotData;
      if ("@Closed@" === token) {
        slot.type = SlotType.Closed;
      } else if ("@Open@" === token) {
        slot.type = SlotType.Open;
      } else if ("@OpenObserver@" === token) {
        slot.type = SlotType.OpenObserver;
      } else if (["@EasyAI@", "@MediumAI@", "@HardAI@"].indexOf(token) !== -1) {
        slot.type = SlotType.Ai;
        let difficulty: number;
        if ("@EasyAI@" === token) difficulty = AiDifficulty.Easy;
        else if ("@MediumAI@" === token) difficulty = AiDifficulty.Medium;
        else {
          if ("@HardAI@" !== token) throw new Error("Couldn't parse gameopt: unknown slot type " + token);
          difficulty = AiDifficulty.Brutal;
        }
        slot.difficulty = difficulty;
      } else {
        slot.type = SlotType.Player;
        slot.name = token;
      }
      list.push(slot);
    }
    return list;
  }

  /**
   * 从二进制缓冲解析单名玩家的动作列表。
   * @param buffer ArrayBuffer / TypedArray / DataStream
   * @returns 动作数组
   */
  parsePlayerActions(buffer: ArrayBuffer | Uint8Array | DataStream): PlayerActionPayload[] {
    const stream = buffer instanceof DataStream ? buffer : new DataStream(buffer as ArrayBuffer);
    const count = stream.readUint8();
    const list: PlayerActionPayload[] = [];
    for (let i = 0; i < count; ++i) {
      const id = stream.readUint8();
      const len = stream.readUint16();
      const params = len > 0 ? stream.readUint8Array(len) : new Uint8Array();
      list.push({ id, params });
    }
    return list;
  }

  /**
   * 从 DataStream 解析「playerId → 动作列表」映射。
   * @param stream 已定位到映射头的 DataStream
   * @returns Map<playerId, PlayerActionPayload[]>
   */
  parseAllPlayerActions(stream: DataStream): Map<number, PlayerActionPayload[]> {
    const count = stream.readUint8();
    const map = new Map<number, PlayerActionPayload[]>();
    for (let i = 0; i < count; ++i) {
      const playerId = stream.readUint8();
      const len = stream.readUint16();
      const payload = len > 0 ? stream.readUint8Array(len) : new Uint8Array();
      const nested = new DataStream(payload.buffer.slice(payload.byteOffset, payload.byteOffset + payload.byteLength) as ArrayBuffer);
      map.set(playerId, this.parsePlayerActions(nested));
    }
    return map;
  }

  /**
   * 地图二进制 → binary string。
   * @param data 地图字节
   * @returns binary string
   */
  parseMapData(data: Uint8Array): string {
    return uint8ArrayToBinaryString(data);
  }
}
