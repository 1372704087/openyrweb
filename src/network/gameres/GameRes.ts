/**
 * GameRes — 战报（Game Result）组装与二进制编解码。
 *
 * 由 network/gameres/GameRes.ts.js 重写为 TS（忠实翻译，行为完全一致）。两个
 * 文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块
 * 的编译产物。
 *
 * 关键语义（勿改）：
 * - 内嵌字段类型枚举 Byte=1/Boolean=2/Time=5/Int=6/String=7 与孪生一致。
 * - fromGame 玩家过滤 OBS_COUNTRY_ID、color 用 rules.colors 序号 *2+1。
 * - getCompletionStatus 嵌套三元与孪生一致（含 2 人局 / >2 人局分支）。
 * - toFlat 键与 BAMR 位打包（mcvRepacks | buildOffAlly<<1）、
 *   fromFlat 对 DSTB/ICAP 缺省 true、MENG/DOGK/DOIL 缺省 false、HRV/STP 缺省 -1。
 * - toBinary 头：uint16BE(body+4) + uint16BE(0) + body。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

import { DataStream } from "data/DataStream"; // 孪生
import { ObjectType } from "engine/type/ObjectType"; // 孪生
import * as GameConstantsModule from "game/gameopts/constants"; // 孪生
import { isNotNullOrUndefined } from "util/typeGuard"; // 孪生
import { GameResType } from "network/gameres/GameResType"; // 孪生
import type { GameResGameInfo } from "network/gameres/GameResGameInfo"; // 类型

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const OBS_COUNTRY_ID: any = (GameConstantsModule as any).OBS_COUNTRY_ID;

/** 战报字段类型（孪生内嵌导出的枚举）。 */
// 与孪生一致：字段类型枚举为模块内部值，不作为命名空间导出（孪生仅导出 GameRes）
enum GameResFieldType {
  Byte = 1,
  Boolean = 2,
  Time = 5,
  Int = 6,
  String = 7,
}

/** 扁平化后的字段值 [类型, 值]。 */
export type FlatValue = [GameResFieldType, unknown];

/** 扁平字段表。 */
export type FlatFields = Record<string, FlatValue>;

/** 战报中的单名玩家统计。 */
export interface GameResPlayerInfo {
  buildingsBuilt: number;
  buildingsCaptured: number;
  buildingsKilled: number;
  buildingsLeft: number;
  color: number;
  cratesFound: number;
  endCredits: number;
  creditsGained: number;
  infantryBuilt: number;
  infantryKilled: number;
  infantryLeft: number;
  lostConnection: boolean;
  name: string;
  planesBuilt: number;
  planesKilled: number;
  planesLeft: number;
  unitsBuilt: number;
  unitsKilled: number;
  unitsLeft: number;
  completionStatus: number;
  country: number;
  side: number;
  team: number;
  startPos: number;
}

/** 战报中的本客户端摘要。 */
export interface GameResClientInfo {
  avgFps: number;
  avgRtt: number;
  finished: boolean;
  gameSku: number;
  outOfSync: boolean;
  pingsRecv: number;
  pingsSent: number;
  clientVers: string;
  quit: boolean;
  accountName: string;
  suddenDisconnect: boolean;
}

/** fromGame 第三参（本地客户端上下文）。 */
export interface GameResClientContext {
  avgFps: number;
  avgRtt: number;
  finished: boolean;
  gameSku: number;
  outOfSync: boolean;
  pingsRecv: number;
  pingsSent: number;
  clientVers: string;
  quit: boolean;
  accountName: string;
  suddenDisconnect: boolean;
}

/** 玩家对象最小接口（fromGame 使用）。 */
export interface GameResPlayerLike {
  name: string;
  country: { id: number; side: number };
  color: { asHex(): string };
  buildings: { size: number };
  credits: number;
  creditsGained: number;
  buildingsCaptured: number;
  cratesPickedUp: number;
  startLocation: number;
  defeated?: boolean;
  resigned?: boolean;
  dropped?: boolean;
  getUnitsBuilt(type: ObjectType): number;
  getUnitsKilled(type: ObjectType): number;
  getOwnedObjectsByType(type: ObjectType): { length: number }[];
}

/** 对局对象最小接口。 */
export interface GameResGameLike {
  id: string;
  startTimestamp: number;
  currentTime: number;
  gameOpts: {
    gameSpeed: number;
    credits: number;
    unitCount: number;
    shortGame: boolean;
    superWeapons: boolean;
    buildOffAlly: boolean;
    mcvRepacks: boolean;
    cratesAppear: boolean;
    gameMode: number;
    mapName: string;
    mapDigest: string;
    destroyableBridges: boolean;
    multiEngineer: boolean;
    noDogEngiKills: boolean;
    instantCapture: boolean;
    delayedOils: boolean;
    humanPlayers: { name: string; countryId: number }[];
    aiPlayers: unknown[];
  };
  getPlayerByName(name: string): GameResPlayerLike;
  alliances: { getAllies(p: GameResPlayerLike): Iterable<GameResPlayerLike> };
  rules: { colors: Map<unknown, { asHex(): string }> };
  stalemateDetectTrait?: { isStale(): boolean; getCountdownTicks(): number };
}

/** 战报。 */
export class GameRes {
  game!: GameResGameInfo;
  players!: GameResPlayerInfo[];
  client!: GameResClientInfo;

  /**
   * 从对局组装战报。
   * @param g 对局
   * @param tournament 是否锦标赛
   * @param client 本地客户端上下文
   * @returns this（链式）
   */
  fromGame(g: GameResGameLike, tournament: boolean, client: GameResClientContext): this {
    const opts = g.gameOpts;
    const humanPlayers = opts.humanPlayers
      .filter((p) => p.countryId !== OBS_COUNTRY_ID)
      .map((p) => g.getPlayerByName(p.name));
    this.game = {
      id: g.id,
      startTime: g.startTimestamp,
      duration: Math.floor(g.currentTime / 1e3),
      speed: 6 - opts.gameSpeed,
      players: humanPlayers.length,
      mapName: opts.mapName,
      mapDigest: opts.mapDigest,
      unitCount: opts.unitCount,
      cratesAppear: opts.cratesAppear,
      credits: opts.credits,
      tournament,
      shortGame: opts.shortGame,
      superWeapons: opts.superWeapons,
      aiPlayers: opts.aiPlayers.filter(isNotNullOrUndefined).length,
      gameMode: opts.gameMode,
      buildOffAlly: opts.buildOffAlly,
      mcvRepacks: opts.mcvRepacks,
      destroyableBridges: opts.destroyableBridges,
      multiEngineer: opts.multiEngineer,
      noDogEngiKills: opts.noDogEngiKills,
      instantCapture: opts.instantCapture,
      delayedOils: opts.delayedOils,
    };
    this.client = client;
    const teams = this.computePlayerTeams(g, humanPlayers);
    this.players = humanPlayers.map((p) => ({
      buildingsBuilt: p.getUnitsBuilt(ObjectType.Building),
      buildingsCaptured: p.buildingsCaptured,
      buildingsKilled: p.getUnitsKilled(ObjectType.Building),
      buildingsLeft: p.buildings.size,
      color: 2 * [...g.rules.colors.values()].findIndex((c) => c.asHex() === p.color.asHex()) + 1,
      cratesFound: p.cratesPickedUp,
      endCredits: p.credits,
      creditsGained: p.creditsGained,
      infantryBuilt: p.getUnitsBuilt(ObjectType.Infantry),
      infantryKilled: p.getUnitsKilled(ObjectType.Infantry),
      infantryLeft: p.getOwnedObjectsByType(ObjectType.Infantry).length,
      lostConnection: p.name === client.accountName && client.suddenDisconnect,
      name: p.name,
      planesBuilt: p.getUnitsBuilt(ObjectType.Aircraft),
      planesKilled: p.getUnitsKilled(ObjectType.Aircraft),
      planesLeft: p.getOwnedObjectsByType(ObjectType.Aircraft).length,
      unitsBuilt: p.getUnitsBuilt(ObjectType.Vehicle),
      unitsKilled: p.getUnitsKilled(ObjectType.Vehicle),
      unitsLeft: p.getOwnedObjectsByType(ObjectType.Vehicle).length,
      completionStatus: this.getCompletionStatus(p, g, this.client, humanPlayers.length),
      country: p.country.id,
      side: p.country.side,
      team: teams.get(p)!,
      startPos: p.startLocation,
    }));
    return this;
  }

  /**
   * 按 alliances 划分队伍编号（连通分量顺序编号）。
   * @param g 对局
   * @param players 参战玩家
   */
  private computePlayerTeams(
    g: GameResGameLike,
    players: GameResPlayerLike[],
  ): Map<GameResPlayerLike, number> {
    const map = new Map<GameResPlayerLike, number>();
    let next = 0;
    for (const p of players) {
      if (!map.has(p)) {
        map.set(p, next);
        for (const a of g.alliances.getAllies(p)) {
          if (!map.has(a)) map.set(a, next);
        }
        next++;
      }
    }
    return map;
  }

  /**
   * 计算单人完成状态（与孪生嵌套三元一致）。
   * @param p 玩家
   * @param g 对局
   * @param c 本客户端
   * @param humanCount 人类玩家数
   */
  private getCompletionStatus(
    p: GameResPlayerLike,
    g: GameResGameLike,
    c: GameResClientInfo,
    humanCount: number,
  ): number {
    if (c.finished) {
      if (g.stalemateDetectTrait?.isStale() && g.stalemateDetectTrait.getCountdownTicks() === 0) {
        return GameResType.Draw;
      }
      if (!p.defeated || [...g.alliances.getAllies(p)].some((a) => !a.defeated)) {
        return GameResType.Win;
      }
      if (p.resigned) return GameResType.Resign;
      if (p.dropped) return GameResType.Disconnect;
      return GameResType.Loss;
    }
    if (c.outOfSync) return GameResType.Disconnect;
    if (humanCount > 2) {
      if (c.accountName !== p.name) return GameResType.Playing;
      if (c.quit) return GameResType.Resign;
      return GameResType.Disconnect;
    }
    if (c.accountName !== p.name) return GameResType.Win;
    if (c.quit) return GameResType.Resign;
    if (p.defeated) return GameResType.Loss;
    return GameResType.Disconnect;
  }

  /** 展平为四字符字段表（toBinary / 传输用）。 */
  toFlat(): FlatFields {
    const playerFields = this.players
      .map((e, i) => ({
        ["BLB" + i]: [GameResFieldType.Time, e.buildingsBuilt] as FlatValue,
        ["BLC" + i]: [GameResFieldType.Int, e.buildingsCaptured] as FlatValue,
        ["BLK" + i]: [GameResFieldType.Time, e.buildingsKilled] as FlatValue,
        ["BLL" + i]: [GameResFieldType.Time, e.buildingsLeft] as FlatValue,
        ["COL" + i]: [GameResFieldType.Int, e.color] as FlatValue,
        ["CRA" + i]: [GameResFieldType.Int, e.cratesFound] as FlatValue,
        ["CRD" + i]: [GameResFieldType.Time, e.endCredits] as FlatValue,
        ["HRV" + i]: [GameResFieldType.Int, e.creditsGained] as FlatValue,
        ["INB" + i]: [GameResFieldType.Time, e.infantryBuilt] as FlatValue,
        ["INK" + i]: [GameResFieldType.Time, e.infantryKilled] as FlatValue,
        ["INL" + i]: [GameResFieldType.Time, e.infantryLeft] as FlatValue,
        ["LCN" + i]: [GameResFieldType.Boolean, e.lostConnection] as FlatValue,
        ["NAM" + i]: [GameResFieldType.String, e.name] as FlatValue,
        ["PLB" + i]: [GameResFieldType.Time, e.planesBuilt] as FlatValue,
        ["PLK" + i]: [GameResFieldType.Time, e.planesKilled] as FlatValue,
        ["PLL" + i]: [GameResFieldType.Time, e.planesLeft] as FlatValue,
        ["UNB" + i]: [GameResFieldType.Time, e.unitsBuilt] as FlatValue,
        ["UNK" + i]: [GameResFieldType.Time, e.unitsKilled] as FlatValue,
        ["UNL" + i]: [GameResFieldType.Time, e.unitsLeft] as FlatValue,
        ["CMP" + i]: [GameResFieldType.Int, e.completionStatus] as FlatValue,
        ["CTY" + i]: [GameResFieldType.Int, e.country] as FlatValue,
        ["SID" + i]: [GameResFieldType.Int, e.side] as FlatValue,
        ["TID" + i]: [GameResFieldType.Int, e.team] as FlatValue,
        ["STP" + i]: [GameResFieldType.Int, e.startPos] as FlatValue,
      }))
      .reduce<FlatFields>((acc, part) => ({ ...acc, ...part }), {});

    return {
      AFPS: [GameResFieldType.Int, this.client.avgFps],
      APNG: [GameResFieldType.Int, this.client.avgRtt],
      AIPL: [GameResFieldType.Int, this.game.aiPlayers],
      CRAT: [GameResFieldType.Boolean, this.game.cratesAppear],
      DURA: [GameResFieldType.Int, this.game.duration],
      FINI: [GameResFieldType.Boolean, this.client.finished],
      GSKU: [GameResFieldType.Int, this.client.gameSku],
      CRED: [GameResFieldType.Int, this.game.credits],
      OOSY: [GameResFieldType.Boolean, this.client.outOfSync],
      PLRS: [GameResFieldType.Int, this.game.players],
      PNGR: [GameResFieldType.Int, this.client.pingsRecv],
      PNGS: [GameResFieldType.Int, this.client.pingsSent],
      SCEN: [GameResFieldType.String, this.game.mapName],
      SHRT: [GameResFieldType.Boolean, this.game.shortGame],
      SPED: [GameResFieldType.Int, this.game.speed],
      SUPR: [GameResFieldType.Boolean, this.game.superWeapons],
      TIME: [GameResFieldType.Time, this.game.startTime],
      TRNY: [GameResFieldType.Boolean, this.game.tournament],
      UNIT: [GameResFieldType.Int, this.game.unitCount],
      VERS: [GameResFieldType.String, this.client.clientVers],
      MODE: [GameResFieldType.Int, this.game.gameMode],
      BAMR: [GameResFieldType.Int, Number(this.game.mcvRepacks) + 2 * Number(this.game.buildOffAlly)],
      MAPC: [GameResFieldType.String, this.game.mapDigest],
      GMID: [GameResFieldType.String, this.game.id],
      SNAM: [GameResFieldType.String, this.client.accountName],
      DSTB: [GameResFieldType.Boolean, this.game.destroyableBridges],
      MENG: [GameResFieldType.Boolean, this.game.multiEngineer],
      DOGK: [GameResFieldType.Boolean, this.game.noDogEngiKills],
      ICAP: [GameResFieldType.Boolean, this.game.instantCapture],
      DOIL: [GameResFieldType.Boolean, this.game.delayedOils],
      ...playerFields,
    };
  }

  /**
   * 从扁平表还原 game / players / client。
   * @param flat 字段表
   */
  fromFlat(flat: FlatFields): void {
    // 孪生助手无 undefined 容错（畸形包在 e[0] 处抛错）、无 Number/String 包装
    const asInt = (v: FlatValue | undefined): number =>
      (v as any)[0] === GameResFieldType.Int || (v as any)[0] === GameResFieldType.Time ? (v as any)[1] : 0;
    const asBool = (v: FlatValue | undefined): boolean => (v as any)[0] === GameResFieldType.Boolean && (v as any)[1];
    const asStr = (v: FlatValue | undefined): string =>
      (v as any)[0] === GameResFieldType.String ? (v as any)[1] : "";

    const plrs = asInt(flat.PLRS);
    const bamr = asInt(flat.BAMR);
    const mcvRepacks = Boolean(1 & bamr);
    const buildOffAlly = Boolean(2 & bamr);

    this.game = {
      aiPlayers: asInt(flat.AIPL),
      cratesAppear: asBool(flat.CRAT),
      duration: asInt(flat.DURA),
      credits: asInt(flat.CRED),
      id: asStr(flat.GMID),
      players: plrs,
      mapName: asStr(flat.SCEN),
      shortGame: asBool(flat.SHRT),
      speed: asInt(flat.SPED),
      superWeapons: asBool(flat.SUPR),
      startTime: asInt(flat.TIME),
      tournament: asBool(flat.TRNY),
      unitCount: asInt(flat.UNIT),
      gameMode: asInt(flat.MODE),
      buildOffAlly,
      mcvRepacks,
      mapDigest: asStr(flat.MAPC),
      destroyableBridges: flat.DSTB === undefined || asBool(flat.DSTB),
      multiEngineer: flat.MENG !== undefined && asBool(flat.MENG),
      noDogEngiKills: flat.DOGK !== undefined && asBool(flat.DOGK),
      instantCapture: flat.ICAP === undefined || asBool(flat.ICAP),
      delayedOils: flat.DOIL !== undefined && asBool(flat.DOIL),
    };

    this.players = new Array(plrs).fill(0).map((_, i) => ({
      buildingsBuilt: asInt(flat["BLB" + i]),
      buildingsCaptured: asInt(flat["BLC" + i]),
      buildingsKilled: asInt(flat["BLK" + i]),
      buildingsLeft: asInt(flat["BLL" + i]),
      color: asInt(flat["COL" + i]),
      cratesFound: asInt(flat["CRA" + i]),
      endCredits: asInt(flat["CRD" + i]),
      creditsGained: flat["HRV" + i] !== undefined ? asInt(flat["HRV" + i]) : -1,
      infantryBuilt: asInt(flat["INB" + i]),
      infantryKilled: asInt(flat["INK" + i]),
      infantryLeft: asInt(flat["INL" + i]),
      lostConnection: asBool(flat["LCN" + i]),
      name: asStr(flat["NAM" + i]),
      planesBuilt: asInt(flat["PLB" + i]),
      planesKilled: asInt(flat["PLK" + i]),
      planesLeft: asInt(flat["PLL" + i]),
      unitsBuilt: asInt(flat["UNB" + i]),
      unitsKilled: asInt(flat["UNK" + i]),
      unitsLeft: asInt(flat["UNL" + i]),
      completionStatus: asInt(flat["CMP" + i]),
      country: asInt(flat["CTY" + i]),
      side: asInt(flat["SID" + i]),
      team: asInt(flat["TID" + i]),
      startPos: flat["STP" + i] !== undefined ? asInt(flat["STP" + i]) : -1,
    }));

    const accountName = asStr(flat.SNAM);
    const self = this.players.find((p) => p.name === accountName);
    this.client = {
      avgFps: asInt(flat.AFPS),
      avgRtt: asInt(flat.APNG ?? [GameResFieldType.Int, 0]),
      finished: asBool(flat.FINI),
      gameSku: asInt(flat.GSKU),
      outOfSync: asBool(flat.OOSY),
      pingsRecv: asInt(flat.PNGR),
      pingsSent: asInt(flat.PNGS),
      clientVers: asStr(flat.VERS),
      quit: self?.completionStatus === GameResType.Resign,
      accountName,
      suddenDisconnect: self?.lostConnection ?? false,
    };
  }

  /** 序列化为战报二进制包（大端长度头）。 */
  toBinary(): Uint8Array {
    const body = new DataStream();
    const flat = this.toFlat();
    for (const key of Object.keys(flat)) {
      const [type, value] = flat[key];
      this.writeType(type, key, value, body);
    }
    const header = new DataStream();
    header.writeUint16(body.byteLength + 4, DataStream.BIG_ENDIAN);
    header.writeUint16(0);
    header.writeUint8Array(new Uint8Array(body.buffer, body.byteOffset, body.byteLength));
    return new Uint8Array(header.buffer, header.byteOffset, header.byteLength);
  }

  /**
   * 从战报二进制包还原。
   * @param data 字节缓冲
   * @throws 头第二字段非 0 时抛 Error
   * @returns this
   */
  fromBinary(data: ArrayBuffer | Uint8Array): this {
    const stream = new DataStream(data as ArrayBuffer);
    const len = stream.readUint16(DataStream.BIG_ENDIAN) - 4;
    if (stream.readUint16() !== 0) {
      throw new Error("Invalid game res packet. Second byte should be 0.");
    }
    const flat: FlatFields = {};
    while (len && stream.position <= len - 4) {
      const { fieldName, type, data: value } = this.readType(stream);
      if (value !== undefined) flat[fieldName] = [type, value];
    }
    this.fromFlat(flat);
    return this;
  }

  /**
   * 写单个字段（4 字符名 + 类型 + 长度 + 值，String 补齐到 4 倍数）。
   * @param type 字段类型
   * @param name 字段名（≤4）
   * @param value 字段值
   * @param stream 输出流
   * @throws 名字过长或类型未处理
   */
  private writeType(type: GameResFieldType, name: string, value: unknown, stream: DataStream): void {
    if (name.length > 4) throw new Error(`Field "${name}" must not exceed 4 characters`);
    stream.writeString(name, "ASCII", 4);
    stream.writeUint16(type, DataStream.BIG_ENDIAN);
    switch (type) {
      case GameResFieldType.Byte:
        stream.writeUint16(1, DataStream.BIG_ENDIAN);
        stream.writeUint32(value as number, DataStream.BIG_ENDIAN);
        return;
      case GameResFieldType.Boolean:
        stream.writeUint16(1, DataStream.BIG_ENDIAN);
        stream.writeUint8Array([value ? 1 : 0, 0, 0, 0]);
        return;
      case GameResFieldType.Time:
      case GameResFieldType.Int:
        stream.writeUint16(4, DataStream.BIG_ENDIAN);
        stream.writeUint32(value as number, DataStream.BIG_ENDIAN);
        return;
      case GameResFieldType.String: {
        const s = String(value);
        const n = s.length + 1;
        stream.writeUint16(n, DataStream.BIG_ENDIAN);
        stream.writeCString(s, 4 * Math.ceil(n / 4));
        return;
      }
      default:
        throw new Error(`Unhandled type "${type}"`);
    }
  }

  /**
   * 读单个字段。
   * @param stream 输入流
   * @returns 字段名、类型、数据（未知类型 data 为 undefined 并跳过）
   */
  private readType(stream: DataStream): {
    fieldName: string;
    type: GameResFieldType;
    data: unknown;
  } {
    const fieldName = stream.readString(4, "ASCII");
    const type = stream.readUint16(DataStream.BIG_ENDIAN) as GameResFieldType;
    const fieldLen = stream.readUint16(DataStream.BIG_ENDIAN);
    let data: unknown;
    switch (type) {
      case GameResFieldType.Byte:
        data = stream.readUint32(DataStream.BIG_ENDIAN);
        break;
      case GameResFieldType.Boolean:
        data = Boolean(stream.readUint8Array(4)[0]);
        break;
      case GameResFieldType.Time:
      case GameResFieldType.Int:
        data = stream.readUint32(DataStream.BIG_ENDIAN);
        break;
      case GameResFieldType.String:
        data = stream.readCString(4 * Math.ceil(fieldLen / 4));
        break;
      default:
        console.warn(`Unknown game res field type "${type}"`);
        stream.position += fieldLen;
        data = undefined;
    }
    return { fieldName, type, data };
  }
}