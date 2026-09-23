/**
 * RevealMapExecutor — 全图开图。
 *
 * 动作 RevealMap：对全部 combatant 调用 mapShroudTrait.revealMap。
 *
 * 由 game/trigger/executor/RevealMapExecutor.ts.js 重写为 TS。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
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
