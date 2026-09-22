/**
 * UnrevealAroundWaypointExecutor — 撤销路径点周围视野。
 *
 * 动作 UnrevealAroundWaypoint：params[1]=路径点；对全部 combatant 的
 * shroud 调用 unrevealAround(tile, general.revealTriggerRadius)。
 *
 * 由 game/trigger/executor/UnrevealAroundWaypointExecutor.ts.js 重写为 TS。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写

/* eslint-disable @typescript-eslint/no-explicit-any */
export class UnrevealAroundWaypointExecutor extends TriggerExecutor {
  execute(game: any): void {
    const wp = Number(this.action.params[1]);
    const tile = game.map.getTileAtWaypoint(wp);
    if (tile) {
      for (const p of game.getCombatants()) {
        game.mapShroudTrait.getPlayerShroud(p)?.unrevealAround(tile, game.rules.general.revealTriggerRadius);
      }
    } else {
      console.warn(`No valid location found for waypoint ${wp}. ` + `Skipping action ${this.getDebugName()}.`);
    }
  }
}
