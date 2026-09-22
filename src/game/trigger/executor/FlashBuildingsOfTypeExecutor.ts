/**
 * FlashBuildingsOfTypeExecutor — 高亮指定类型建筑。
 *
 * 动作 131: FlashBuildingsOfType — params[1]=建筑类型名；为空时高亮该
 * 阵营所有建筑。收集 id 写入 game.pendingUnitFlash，由 GUI 轮询播放。
 *
 * 由 game/trigger/executor/FlashBuildingsOfTypeExecutor.ts.js 重写为 TS。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写

/* eslint-disable @typescript-eslint/no-explicit-any */
export class FlashBuildingsOfTypeExecutor extends TriggerExecutor {
  private resolveHousePlayer(game: any, name: any): any {
    if (!name) return undefined;
    const s = String(name).trim();
    if (!s) return undefined;
    let p = game.housePlayers.get(s);
    if (p) return p;
    if (/^\d+$/.test(s)) {
      const h = game.campaignHouses && game.campaignHouses[Number(s)];
      if (h) p = game.housePlayers.get(h.name);
      if (p) return p;
    }
    p = game.getAllPlayers().find((q) => !q.defeated && q.country?.name === s);
    if (p) return p;
    const lower = s.toLowerCase();
    for (const [k, v] of game.housePlayers) {
      if (k.toLowerCase() === lower) return v;
    }
    p = game.getAllPlayers().find(
      (q) => q.name === s || (q.scenarioAliases || []).some((a) => String(a).toLowerCase() === lower),
    );
    return p;
  }

  execute(game: any): void {
    const owner = this.resolveHousePlayer(game, this.trigger.houseName);
    if (!owner) {
      console.warn(`Invalid house "${this.trigger.houseName}" for ${this.getDebugName()}.`);
      return;
    }
    const type = String(this.action.params[1] || "").trim().toLowerCase();
    const ids: any[] = [];
    for (const obj of owner.getOwnedObjects()) {
      if (!obj.isBuilding || !obj.isBuilding() || !obj.isSpawned || obj.isDestroyed) continue;
      if (type && obj.name.toLowerCase() !== type) continue;
      ids.push(obj.id);
    }
    if (!ids.length) {
      console.warn(`FlashBuildingsOfType: no buildings matched for ${owner.name} type="${type || "*"}"`);
      return;
    }
    game.pendingUnitFlash = { ids, cycles: 3 };
    console.warn(
      `[OpenYRWeb] FlashBuildingsOfType: ${owner.name} highlighted ${ids.length} building(s) type="${type || "*"}`,
    );
  }
}
