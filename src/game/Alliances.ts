/**
 * Alliances — 玩家结盟状态机（请求/接受/撤回/破裂）与敌对关系推导。
 *
 * 结盟流程（状态机）：人类战斗方 request() 发起 → 盟约以 Requested 状态
 * 挂表（pair.first 固定为"被请求方"，即 request 的第一个参数）→ 对方
 * acceptRequest() 后转为 Formed 才算真正结盟（影响视野共享、攻击判定、
 * AI 外交）；期间发起方可 cancelRequest() 撤回，结盟后可 breakAlliance()。
 * AI 不可发起请求；观察者与自身天然共享视野（haveSharedIntel）。
 *
 * 敌对推导：getHostilePlayers() 取全部战斗方两两组合中"尚未结盟"的对，
 * canFormAlliance 据此设限——若两人已不存在"拥有共同敌人"的组合关系
 * （例如一方已无敌人），则拒绝再结盟，防止出现无敌阵营。
 *
 * getHash() 把全部盟约编码为 FNV 散列，供锁步联机两端校验外交状态一致。
 *
 * 由 game/Alliances.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { fnv32a } from "util/math";
import type { Player } from "game/Player";
import type { PlayerList } from "game/PlayerList";

/** 结盟状态：已请求（等待对方接受）→ 已结盟。 */
export enum AllianceStatus {
  Requested = 0,
  Formed = 1,
}

/** 无序玩家对：equals 不区分先后（查找盟约时 A-B 与 B-A 视为同一条）。 */
class PlayerPair {
  first: Player;
  second: Player;

  constructor(first: Player, second: Player) {
    this.first = first;
    this.second = second;
  }

  has(player: Player): boolean {
    return this.first === player || this.second === player;
  }

  equals(other: PlayerPair): boolean {
    return (
      (this.first === other.first && this.second === other.second) ||
      (this.first === other.second && this.second === other.first)
    );
  }
}

/** 一条盟约：玩家对 + 当前状态。 */
interface AllianceEntry {
  players: PlayerPair;
  status: AllianceStatus;
}

export class Alliances {
  playerList: PlayerList;
  alliances: AllianceEntry[] = [];

  constructor(playerList: PlayerList) {
    this.playerList = playerList;
  }

  findByPlayers(playerA: Player, playerB: Player): AllianceEntry | undefined {
    const pair = new PlayerPair(playerA, playerB);
    return this.alliances.find((entry) => entry.players.equals(pair));
  }

  /** 该玩家参与的全部盟约（含 Requested 与 Formed）。 */
  filterByPlayer(player: Player): AllianceEntry[] {
    return this.alliances.filter(
      (entry) => entry.players.first === player || entry.players.second === player,
    );
  }

  /** requester 向 player 发起结盟请求（requester 须为非 AI 战斗方）。 */
  request(player: Player, requester: Player): AllianceEntry | undefined {
    if (!this.canRequestAlliance(requester))
      throw new Error(`Player ${requester.name} is not a human combatant.`);
    if (this.canFormAlliance(player, requester)) {
      if (this.findByPlayers(player, requester))
        throw new Error(
          "Can't request alliance because an alliance is already pending or formed between " +
            `${player.name} and ${requester.name}.`,
        );
      return this.setAlliance(player, requester, AllianceStatus.Requested);
    }
    return undefined;
  }

  /** requester 撤回自己发出的请求。 */
  cancelRequest(player: Player, requester: Player): void {
    const entry = this.findByPlayers(player, requester);
    if (!entry || entry.status !== AllianceStatus.Requested)
      throw new Error(
        `There is no pending alliance request for player ${requester.name} from player ` + player.name,
      );
    if (entry.players.first !== player)
      throw new Error(`Can't cancel request initiated by the other player (${requester.name})`);
    this.alliances.splice(this.alliances.indexOf(entry), 1);
  }

  /** player 接受 requester 发来的请求，结盟成立。 */
  acceptRequest(player: Player, requester: Player): void {
    if (this.canFormAlliance(player, requester)) {
      const entry = this.findByPlayers(player, requester);
      if (!entry || entry.status !== AllianceStatus.Requested)
        throw new Error(
          `There is no pending alliance request for player ${requester.name} from player ` + player.name,
        );
      if (entry.players.first !== player)
        throw new Error("Can't accept own alliance request for player " + requester.name);
      entry.status = AllianceStatus.Formed;
    }
  }

  /** 直接设置盟约（内部用；绕过请求流程前仍校验 canFormAlliance）。 */
  setAlliance(playerA: Player, playerB: Player, status: AllianceStatus): AllianceEntry {
    if (!this.canFormAlliance(playerA, playerB))
      throw new Error(`Can't form alliance between players "${playerA.name}" and "${playerB.name}"`);
    let entry;
    if ((entry = this.findByPlayers(playerA, playerB)))
      throw new Error(`An alliance already exists between players ${playerA.name} and ` + playerB.name);
    entry = { players: new PlayerPair(playerA, playerB), status };
    this.alliances.push(entry);
    return entry;
  }

  /** 解除已成立的结盟（Requested 状态走 cancelRequest）。 */
  breakAlliance(playerA: Player, playerB: Player): void {
    const entry = this.findByPlayers(playerA, playerB);
    if (!entry || entry.status !== AllianceStatus.Formed)
      throw new Error(`There is no alliance between player ${playerA.name} and player ` + playerB.name);
    this.alliances.splice(this.alliances.indexOf(entry), 1);
  }

  /** 两人当前是否处于 Formed 结盟（Requested 不算）。 */
  areAllied(playerA: Player, playerB: Player): boolean {
    const entry = this.findByPlayers(playerA, playerB);
    return !!entry && entry.status === AllianceStatus.Formed;
  }

  /** 与 player 已结盟（Formed）的所有玩家。 */
  getAllies(player: Player): Player[] {
    return this.filterByPlayer(player)
      .filter((entry) => entry.status === AllianceStatus.Formed)
      .map((entry) => (entry.players.first === player ? entry.players.second : entry.players.first));
  }

  /** 两人是否共享视野/情报：观察者全知、自己对自己、或已结盟。 */
  haveSharedIntel(playerA: Player, playerB: Player): boolean {
    return playerA.isObserver || playerB.isObserver || playerA === playerB || this.areAllied(playerA, playerB);
  }

  /** 只有"仍在作战的人类玩家"能发起结盟请求。 */
  canRequestAlliance(player: Player): boolean {
    return player.isCombatant() && !player.isAi;
  }

  /**
   * 结盟可行性判定（三重条件，防止出现"无敌阵营"）：
   *  1. A 仍有独立敌人（存在含 A 不含 B 的敌对对）；
   *  2. B 也有独立敌人；
   *  3. 除他们自己之外还有别的敌对对（两人结盟后世界不归零）。
   */
  canFormAlliance(playerA: Player, playerB: Player): boolean {
    const hostile = this.getHostilePlayers();
    if (hostile.filter((pair) => pair.has(playerA) && !pair.has(playerB)).length === 0) return false;
    if (hostile.filter((pair) => pair.has(playerB) && !pair.has(playerA)).length === 0) return false;
    const self = new PlayerPair(playerA, playerB);
    return !!hostile.filter((pair) => !pair.equals(self)).length;
  }

  /**
   * 所有战斗方两两组合中"当前互不结盟"的对——即理论上的敌对关系全集。
   * 结盟会从这张表里消去对应组合，canFormAlliance 以它为判定基础。
   */
  getHostilePlayers(): PlayerPair[] {
    let pair: PlayerPair;
    const combatants = this.playerList.getCombatants();
    const hostile: PlayerPair[] = [];
    for (let i = 0; i < combatants.length; i++)
      for (let j = i + 1; j < combatants.length; j++)
        if (!this.getAllies(combatants[i]).includes(combatants[j])) {
          pair = new PlayerPair(combatants[i], combatants[j]);
          hostile.push(pair);
        }
    return hostile;
  }

  /** 锁步校验用散列：每条盟约编码为 [first序号, second序号, 状态] 后整体 FNV。 */
  getHash(): number {
    return fnv32a(
      this.alliances
        .map((entry) => [
          this.playerList.getPlayerNumber(entry.players.first),
          this.playerList.getPlayerNumber(entry.players.second),
          entry.status,
        ])
        .flat(),
    );
  }

  /** 调试输出：展开盟约为 [名字, 名字, 状态]。 */
  debugGetState() {
    return this.alliances.map((entry) => ({
      first: entry.players.first,
      second: entry.players.second,
      status: entry.status,
    }));
  }
}
