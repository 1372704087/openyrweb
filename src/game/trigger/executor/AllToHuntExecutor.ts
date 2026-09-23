/**
 * AllToHuntExecutor — 全部搜索动作。
 *
 * 动作 6: AllToHunt — 触发阵营所有战斗单位取消当前任务，向敌方发起攻击移动。
 * 优先走 scenarioTeamRuntime.allToHunt；否则用 AttackMove 到首个敌对阵营
 * 出生点/可见敌方位置近似实现。
 *
 * 由 game/trigger/executor/AllToHuntExecutor.ts.js 重写为 TS。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写
import { OrderType } from "game/order/OrderType"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class AllToHuntExecutor extends TriggerExecutor {
  /** HouseName → Player（索引 / 数字 campaign / 国家名 / 别名，大小写不敏感）。 */
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
    // 战役路径：ScenarioTeamRuntime 一键 allToHunt
    if (game.scenarioTeamRuntime && game.scenarioTeamRuntime.allToHunt(owner.scenarioHouseName || owner.name)) {
      console.warn(`[OpenYRWeb] AllToHunt: ${owner.name} via scenarioTeamRuntime`);
      return;
    }
    // 取第一个敌对阵营出生点作为攻击移动目标
    const enemy = game.getAllPlayers().find(
      (q) =>
        q !== owner &&
        !q.isNeutral &&
        !q.isObserver &&
        !q.defeated &&
        !game.alliances.areAllied(owner, q),
    );
    let targetTile: any = undefined;
    if (enemy) {
      const sl = game.map.startingLocations[enemy.startLocation];
      if (sl) targetTile = game.map.tiles.getByMapCoords(sl.x, sl.y);
      if (!targetTile && enemy.getOwnedObjects) {
        const b = enemy.getOwnedObjects().find((o) => o.isSpawned && !o.isDestroyed && o.tile);
        if (b) targetTile = b.tile;
      }
    }
    // 找到该阵营 Bot，用其 actionsApi 批量下令
    let bot: any = undefined;
    if (game.botManager && game.botManager.bots) {
      for (const [player, b] of game.botManager.bots) {
        if (player === owner || b.name === owner.name) {
          bot = b;
          break;
        }
      }
    }
    let count = 0;
    const ids: any[] = [];
    for (const obj of owner.getOwnedObjects()) {
      if (!obj.isUnit || !obj.isSpawned || obj.isDestroyed || !obj.unitOrderTrait) continue;
      try {
        obj.unitOrderTrait.cancelAllTasks();
        ids.push(obj.id);
        count++;
      } catch (_) {
        /* 与孪生一致：忽略异常 */
      }
    }
    if (bot && bot.actionsApi && ids.length && targetTile) {
      try {
        bot.actionsApi.orderUnits(ids, OrderType.AttackMove, targetTile.rx, targetTile.ry);
      } catch (_) {
        /* ignore */
      }
    }
    console.warn(`[OpenYRWeb] AllToHunt: ${owner.name}, units=${count}, enemy=${enemy?.name || "none"}`);
  }
}
