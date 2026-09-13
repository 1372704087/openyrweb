/**
 * Alliances — 玩家结盟状态机（请求/接受/破裂）与敌对关系推导。
 *
 * 由 game/Alliances.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { fnv32a } from "util/math";
import type { Player } from "game/Player";
import type { PlayerList } from "game/PlayerList";

export enum AllianceStatus {
  Requested = 0,
  Formed = 1,
}

/** 无序玩家对：equals 不区分先后。 */
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

interface AllianceEntry {
  players: PlayerPair;
  status: AllianceStatus;
}

export class Alliances {
  playerList: PlayerList;
  alliances: AllianceEntry[] = [];

  constructor(playerList: PlayerList) {
    this.playerList = playerList;
    this.alliances = [];
  }

  findByPlayers(playerA: Player, playerB: Player): AllianceEntry | undefined {
    const pair = new PlayerPair(playerA, playerB);
    return this.alliances.find((entry) => entry.players.equals(pair));
  }

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

  breakAlliance(playerA: Player, playerB: Player): void {
    const entry = this.findByPlayers(playerA, playerB);
    if (!entry || entry.status !== AllianceStatus.Formed)
      throw new Error(`There is no alliance between player ${playerA.name} and player ` + playerB.name);
    this.alliances.splice(this.alliances.indexOf(entry), 1);
  }

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

  haveSharedIntel(playerA: Player, playerB: Player): boolean {
    return playerA.isObserver || playerB.isObserver || playerA === playerB || this.areAllied(playerA, playerB);
  }

  canRequestAlliance(player: Player): boolean {
    return player.isCombatant() && !player.isAi;
  }

  /** 两两之间尚无共同敌对方、且双方互不相同的组合才可结盟。 */
  canFormAlliance(playerA: Player, playerB: Player): boolean {
    const hostile = this.getHostilePlayers();
    if (hostile.filter((pair) => pair.has(playerA) && !pair.has(playerB)).length === 0) return false;
    if (hostile.filter((pair) => pair.has(playerB) && !pair.has(playerA)).length === 0) return false;
    const self = new PlayerPair(playerA, playerB);
    return !!hostile.filter((pair) => !pair.equals(self)).length;
  }

  /** 所有战斗方两两组成的"当前互不结盟"对。 */
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

  /** 锁步校验用散列：盟约双方玩家序号 + 状态的 FNV 散列。 */
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

  debugGetState() {
    return this.alliances.map((entry) => ({
      first: entry.players.first,
      second: entry.players.second,
      status: entry.status,
    }));
  }
}
