/**
 * PlayerList — 玩家集合。
 *
 * 由 game/PlayerList.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { SideType } from "game/SideType";
import type { Player } from "game/Player";

export class PlayerList {
  players: Player[] = [];

  addPlayer(player: Player): void {
    this.players.push(player);
  }

  getPlayerAt(index: number): Player {
    if (index >= this.players.length) throw new RangeError(`Player #${index} out of bounds`);
    return this.players[index];
  }

  getPlayerByName(name: string): Player {
    const player = this.players.find((player) => player.name === name);
    if (!player) throw new Error(`Player with name "${name}" not found`);
    return player;
  }

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

  getCivilian(): Player | undefined {
    return this.players.find((player) => player.country?.side === SideType.Civilian);
  }

  getAll(): Player[] {
    return this.players;
  }
}
