/**
 * DestroyTeamExecutor — 销毁指定名称的小队。
 *
 * 动作 5 (RA2) / 77 (YR): DestroyTeam — 将同名活跃小队标记为完成并停止脚本推进。
 * 单位本身保留在地图上（原版 DestroyTeam 只解散小队、回收脚本控制）。
 * 优先 scenarioTeamRuntime.destroyTeam；否则遍历 AI 引擎 destroyTeam。
 *
 * 由 game/trigger/executor/DestroyTeamExecutor.ts.js 重写为 TS。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写

/* eslint-disable @typescript-eslint/no-explicit-any */
export class DestroyTeamExecutor extends TriggerExecutor {
  execute(game: any): void {
    const teamName = String(this.action.params[1] || "").trim();
    if (!teamName || teamName === "0" || /^(?:none|<none>)$/i.test(teamName)) {
      console.warn(`DestroyTeam has no team id (${this.getDebugName()}).`);
      return;
    }
    if (game.scenarioTeamRuntime && game.scenarioTeamRuntime.destroyTeam(teamName)) {
      console.warn(`[OpenYRWeb] DestroyTeam: "${teamName}" via scenarioTeamRuntime @ tick ${game.currentTick}`);
      return;
    }
    const bots = game.botManager && game.botManager.bots ? game.botManager.bots : undefined;
    let total = 0;
    for (const [, bot] of bots ? bots : []) {
      const eng = bot && bot.aiApi ? bot.aiApi.engine : undefined;
      if (!eng || !eng.parsed) continue;
      total += eng.destroyTeam(teamName) || 0;
    }
    console.warn(
      `[OpenYRWeb] DestroyTeam: "${teamName}" destroyed ${total} active instance(s) @ tick ${game.currentTick}`,
    );
  }
}
