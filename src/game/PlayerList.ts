/**
 * PlayerList — 玩家集合（一局游戏中全部玩家的注册表）。
 *
 * 由 GameFactory 在开局时构建：按座位序加入人类/AI/中立/观察者玩家，
 * 之后作为 Alliances、Game、EVA 等系统查找玩家的唯一入口。
 * 玩家序号（index）参与锁步校验（Alliances.getHash 用它编码盟约），
 * 因此加入顺序必须各客户端一致。
 *
 * 查询语义速查：
 *  - getPlayerAt / getPlayerNumber ：按座位序号双向查找，越界/不存在即抛错；
 *  - getCombatants  ：仍在作战的玩家（非中立、非观察者、未战败）；
 *  - getNonNeutral  ：排除中立平民（用于胜负判定等）；
 *  - getCivilian    ：平民国家的玩家（便于保护性判定，可返回 undefined）。
 *
 * 由 game/PlayerList.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { SideType } from "game/SideType";
import type { Player } from "game/Player";

export class PlayerList {
  /** 座位序即数组序（序号参与锁步散列，勿乱序）。 */
  players: Player[] = [];

  addPlayer(player: Player): void {
    this.players.push(player);
  }

  /** 按座位序号取玩家，越界抛 RangeError。 */
  getPlayerAt(index: number): Player {
    if (index >= this.players.length) throw new RangeError(`Player #${index} out of bounds`);
    return this.players[index];
  }

  /** 按 INI 内部名查找，找不到抛 Error。 */
  getPlayerByName(name: string): Player {
    const player = this.players.find((player) => player.name === name);
    if (!player) throw new Error(`Player with name "${name}" not found`);
    return player;
  }

  /** 查玩家座位序号，不属于本局则抛 Error。 */
  getPlayerNumber(player: Player): number {
    const index = this.players.indexOf(player);
    if (index === -1) throw new Error(`Player ${player.name} not found`);
    return index;
  }

  getCombatants(): Player[] {
    return this.players.filter((player) => player.isCombatant());
  }

  getNonNeutral(): Player[] {
    return this.players.filter((player) => !player.isNeutral);
  }

  /** 找平民国家玩家（看 country.side 是否为 Civilian），可能不存在。 */
  getCivilian(): Player | undefined {
    return this.players.find((player) => player.country?.side === SideType.Civilian);
  }

  getAll(): Player[] {
    return this.players;
  }
}
