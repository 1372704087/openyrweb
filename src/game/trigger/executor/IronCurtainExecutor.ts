/**
 * IronCurtainExecutor — 在路径点释放铁幕。
 *
 * 动作 IronCurtainAt：params[6]=路径点；解析触发器所属阵营未败北玩家，
 * 找到 IronCurtain 超武规则后经 SuperWeaponsTrait.activateEffect 施放。
 *
 * 由 game/trigger/executor/IronCurtainExecutor.ts.js 重写为 TS。
 */
import { SuperWeaponsTrait } from "game/trait/SuperWeaponsTrait"; // 孪生
import { SuperWeaponType } from "game/type/SuperWeaponType"; // 孪生
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写

/* eslint-disable @typescript-eslint/no-explicit-any */
export class IronCurtainExecutor extends TriggerExecutor {
  execute(game: any): void {
    const wp = this.action.params[6];
    const tile = game.map.getTileAtWaypoint(wp);
    if (!tile) {
      console.warn(`No valid location found for waypoint ${wp}. ` + `Skipping action ${this.getDebugName()}.`);
      return;
    }
    const owner = game.getAllPlayers().find((p) => !p.defeated && p.country?.name === this.trigger.houseName);
    if (!owner) return;
    const rules = [...game.rules.superWeaponRules.values()].find((r) => r.type === SuperWeaponType.IronCurtain);
    if (rules) {
      game.traits.get(SuperWeaponsTrait).activateEffect(rules, tile, game, tile, undefined, true);
    }
  }
}
