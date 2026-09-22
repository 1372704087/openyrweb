/**
 * TeleportAllExecutor — 将触发阵营全部存活单位传送到路径点（动作 128）。
 *
 * 路径点 params[6]（缺省 0）。resolveHousePlayer 按多重兜底解析
 * houseName：housePlayers 精确 → 数字 campaignHouses → country.name
 * → 大小写不敏感 housePlayers → name/scenarioAliases。对 owner 的
 * 每个存活可移动单位调 moveTrait.teleportUnitToTile，计数并
 * console.warn 汇总。路径点/house 无效均 warn 并 return。
 *
 * 由 game/trigger/executor/TeleportAllExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TeleportAllExecutor extends TriggerExecutor {
  /** 多级兜底解析 houseName → 玩家。 */
  resolveHousePlayer(world: any, name: any): any {
    if (!name) return undefined;
    const s = String(name).trim();
    if (!s) return undefined;
    let player = world.housePlayers.get(s);
    if (player) return player;
    if (/^\d+$/.test(s)) {
      const h = world.campaignHouses && world.campaignHouses[Number(s)];
      if (h) player = world.housePlayers.get(h.name);
      if (player) return player;
    }
    player = world.getAllPlayers().find((q: any) => !q.defeated && q.country?.name === s);
    if (player) return player;
    const lower = s.toLowerCase();
    for (const [k, v] of world.housePlayers) if (k.toLowerCase() === lower) return v;
    player = world
      .getAllPlayers()
      .find(
        (q: any) =>
          q.name === s ||
          (q.scenarioAliases || []).some((a: any) => String(a).toLowerCase() === lower),
      );
    return player;
  }

  /** 传送 owner 全部存活可移动单位到路径点。 */
  execute(world: any): void {
    const waypoint = Number(this.action.params[6]) || 0;
    const tile = world.map.getTileAtWaypoint(waypoint);
    if (!tile) {
      console.warn(`TeleportAll: no valid location for waypoint ${waypoint}. Skipping ${this.getDebugName()}.`);
      return;
    }
    const owner = this.resolveHousePlayer(world, this.trigger.houseName);
    if (!owner) {
      console.warn(`Invalid house "${this.trigger.houseName}" for ${this.getDebugName()}.`);
      return;
    }
    let count = 0;
    for (const obj of owner.getOwnedObjects()) {
      if (!obj.isUnit || !obj.isSpawned || obj.isDestroyed || !obj.moveTrait) continue;
      try {
        obj.moveTrait.teleportUnitToTile(tile, undefined, true, false, world);
        count++;
      } catch (_) {}
    }
    console.warn(`[OpenYRWeb] TeleportAll: ${owner.name}, teleported ${count} unit(s) @ waypoint ${waypoint}`);
  }
}
