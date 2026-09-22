/**
 * DestroyAllExecutor — 销毁触发器所属阵营的全部/分类单位建筑。
 *
 * 动作 119 DestroyAll / 120 DestroyAllBuildings / 121 DestroyAllLandUnits
 *      / 122 DestroyAllNavalUnits
 * scope = "all" | "buildings" | "land-units" | "naval-units"（工厂第三参）。
 * mind control 中的单位按原属主判定归属。
 *
 * 由 game/trigger/executor/DestroyAllExecutor.ts.js 重写为 TS。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写

/* eslint-disable @typescript-eslint/no-explicit-any */
export class DestroyAllExecutor extends TriggerExecutor {
  /** 摧毁范围子集。 */
  readonly scope: string;

  constructor(action: any, trigger: any, scope?: string) {
    super(action, trigger);
    this.scope = scope || "all";
  }

  /** params[1] 数字 campaign id → 否则按 houseName / 别名解析。 */
  private resolveOwner(game: any): any {
    const hid = Number(this.action.params[1]);
    if (hid !== -1 && game.campaignHouses && game.campaignHouses[hid]) {
      const h = game.campaignHouses[hid];
      const p = game.housePlayers.get(h.name);
      if (p) return p;
    }
    const houseName = String(this.trigger.houseName || "").trim();
    const lowerHouse = houseName.toLowerCase();
    return (
      game.housePlayers.get(houseName) ||
      game.getAllPlayers().find(
        (p) =>
          !p.defeated &&
          (p.country?.name === houseName ||
            p.name === houseName ||
            (p.scenarioAliases || []).some((a) => String(a).toLowerCase() === lowerHouse)),
      ) ||
      undefined
    );
  }

  private isTarget(game: any, obj: any, owner: any): boolean {
    if (obj.isDestroyed || !obj.isSpawned) return false;
    const o = obj.mindControllableTrait?.getOriginalOwner
      ? obj.mindControllableTrait.getOriginalOwner()
      : obj.owner;
    if (o !== owner) return false;
    switch (this.scope) {
      case "buildings":
        return obj.isBuilding();
      case "land-units":
        return obj.isUnit() && !obj.rules.naval;
      case "naval-units":
        return obj.isUnit() && !!obj.rules.naval;
      default:
        return true;
    }
  }

  execute(game: any): void {
    const owner = this.resolveOwner(game);
    if (!owner) {
      console.warn(`Invalid house "${this.trigger.houseName}" for ${this.getDebugName()}.`);
      return;
    }
    let count = 0;
    for (const player of game.getAllPlayers()) {
      for (const obj of player.getOwnedObjects()) {
        if (this.isTarget(game, obj, owner)) {
          try {
            game.destroyObject(obj, undefined, true);
            count++;
          } catch (_) {
            /* ignore */
          }
        }
      }
    }
    console.warn(`[OpenYRWeb] DestroyAll(${this.scope}): ${owner.name}, destroyed ${count}`);
  }
}
