/**
 * AllianceExecutor — 结盟动作。
 *
 * 动作 37: Alliance/MakeAlly — 使触发器所属阵营与指定阵营结盟（Formed）。
 * 目标解析：params[1]=目标阵营 ID（-1 任意）；先 country.id → [Houses]
 * 索引（campaignHouses）→ 13+索引。
 *
 * 由 game/trigger/executor/AllianceExecutor.ts.js 重写为 TS。
 */
import { AllianceStatus } from "game/Alliances"; // 孪生
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写

/* eslint-disable @typescript-eslint/no-explicit-any */
export class AllianceExecutor extends TriggerExecutor {
  /** 目标阵营国家/索引 id。 */
  readonly houseId: number;

  constructor(action: any, trigger: any) {
    super(action, trigger);
    this.houseId = Number(action.params[1]);
  }

  /** 触发器的所属阵营（[Triggers] 行首 HouseName）。 */
  private resolveSource(game: any): any {
    const n = this.trigger.houseName;
    if (!n) return undefined;
    return game.housePlayers.get(n) || game.getAllPlayers().find((p) => p.country?.name === n);
  }

  /** 目标阵营：-1 任意；country.id → [Houses] 索引 → 13+索引。 */
  private resolveTarget(game: any, source: any): any {
    if (this.houseId === -1) {
      return game.getAllPlayers().find((p) => p !== source);
    }
    let p = game.getAllPlayers().find((x) => x.country?.id === this.houseId);
    if (!p && game.campaignHouses) {
      const h = game.campaignHouses[this.houseId] ?? game.campaignHouses[this.houseId - 13];
      if (h) p = game.housePlayers.get(h.name);
    }
    return p;
  }

  execute(game: any): void {
    const src = this.resolveSource(game);
    const dst = this.resolveTarget(game, src);
    if (!src || !dst || src === dst || game.alliances.areAllied(src, dst)) return;
    try {
      const rel = game.alliances.setAlliance(src, dst, AllianceStatus.Formed);
      game.onAllianceChange(rel, src, true);
      console.warn(`[OpenYRWeb] Alliance: ${src.name} <-> ${dst.name} (Formed)`);
    } catch (err: any) {
      console.warn(`[OpenYRWeb] Alliance action failed: ${err.message}`);
    }
  }
}
