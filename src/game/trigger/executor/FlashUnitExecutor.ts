/**
 * FlashUnitExecutor — 单元高亮/闪烁。
 *
 * 动作 64/65/66 (FlashSmall/Medium/Large) + 74 (FlashTeam)：高亮地图上的
 * 单元以吸引玩家注意（RA2 战役演出常用）。
 * 实现：收集目标单元 id 写入 game.pendingUnitFlash，GUI 层（GameScreen）
 * 轮询消费并调用渲染实体的高亮动画。
 * cycles：Small=1 / Medium=3 / Large=6 / Team=2。
 *
 * 由 game/trigger/executor/FlashUnitExecutor.ts.js 重写为 TS。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写
import { TriggerActionType } from "data/map/trigger/TriggerActionType"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
export class FlashUnitExecutor extends TriggerExecutor {
  execute(game: any): void {
    const ids: any[] = [];
    let cycles = 2;
    switch (this.action.type) {
      case TriggerActionType.FlashSmall:
        cycles = 1;
        break;
      case TriggerActionType.FlashMedium:
        cycles = 3;
        break;
      case TriggerActionType.FlashLarge:
        cycles = 6;
        break;
      case TriggerActionType.FlashTeam:
        cycles = 2;
        break;
    }
    if (this.action.type === TriggerActionType.FlashTeam) {
      const teamName = String(this.action.params[1] || "").trim();
      if (!teamName) {
        console.warn(`FlashTeam has no team id (${this.getDebugName()}).`);
        return;
      }
      const lower = teamName.toLowerCase();
      const bots = game.botManager && game.botManager.bots ? game.botManager.bots : undefined;
      for (const [, bot] of bots ? bots : []) {
        const eng = bot && bot.aiApi ? bot.aiApi.engine : undefined;
        if (!eng || !eng.parsed) continue;
        for (const team of eng.activeTeams || []) {
          const name = team.teamType && team.teamType.name;
          if (name && name.toLowerCase() === lower) {
            for (const uid of team.unitIds || []) ids.push(uid);
          }
        }
      }
      if (!ids.length) {
        console.warn(`FlashTeam: team "${teamName}" has no active units (${this.getDebugName()}).`);
        return;
      }
    } else {
      // FlashSmall/Medium/Large：高亮地图上所有已生成的技术单元
      for (const obj of game.updatableObjects) {
        if (obj.isSpawned && !obj.isDestroyed && obj.isTechno()) ids.push(obj.id);
      }
    }
    game.pendingUnitFlash = { ids, cycles };
    console.debug(
      `[OpenYRWeb] ${TriggerActionType[this.action.type]}: highlight ${ids.length} unit(s) (${this.getDebugName()}).`,
    );
  }
}
