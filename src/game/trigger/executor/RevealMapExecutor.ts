/**
 * RevealMapExecutor — 全图开图。
 *
 * 动作 RevealMap：对全部 combatant 调用 mapShroudTrait.revealMap。
 *
 * 由 game/trigger/executor/RevealMapExecutor.ts.js 重写为 TS。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写

/* eslint-disable @typescript-eslint/no-explicit-any */
export class RevealMapExecutor extends TriggerExecutor {
  execute(game: any): void {
    for (const p of game.getCombatants()) {
      game.mapShroudTrait.revealMap(p, game);
    }
  }
}
