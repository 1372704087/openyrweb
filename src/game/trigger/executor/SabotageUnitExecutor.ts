/**
 * SabotageUnitExecutor — 破坏单位动作。
 *
 * 动作 87: SabotageUnit — 破坏指定路径点区域（3x3）的敌方技术单位。
 * 简化实现：对路径点所在格邻近格（切比雪夫距离 ≤1）的敌方单位直接销毁。
 *
 * 由 game/trigger/executor/SabotageUnitExecutor.ts.js 重写为 TS。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写

/* eslint-disable @typescript-eslint/no-explicit-any */
export class SabotageUnitExecutor extends TriggerExecutor {
  execute(game: any): void {
    const wp = Number(this.action.params[1]);
    const tile = game.map.getTileAtWaypoint(wp);
    if (!tile) {
      console.warn(`No valid location found for waypoint ${wp}. Skipping action ${this.getDebugName()}.`);
      return;
    }
    const houseName = String(this.trigger.houseName || "").trim();
    const lowerHouse = houseName.toLowerCase();
    const p =
      game.housePlayers.get(houseName) ||
      game.getAllPlayers().find(
        (x) =>
          !x.defeated &&
          (x.country?.name === houseName ||
            x.name === houseName ||
            (x.scenarioAliases || []).some((a) => String(a).toLowerCase() === lowerHouse)),
      );
    if (!p) {
      console.warn(`Invalid house "${this.trigger.houseName}" for ${this.getDebugName()}.`);
      return;
    }
    let count = 0;
    for (const obj of game.updatableObjects) {
      if (!obj.isSpawned || obj.isDestroyed || !obj.isTechno() || !obj.tile) continue;
      const d = Math.max(Math.abs(obj.tile.rx - tile.rx), Math.abs(obj.tile.ry - tile.ry));
      if (d > 1) continue;
      if (obj.owner === p || game.alliances.areAllied(p, obj.owner)) continue;
      game.destroyObject(obj);
      count++;
    }
    console.warn(`[OpenYRWeb] SabotageUnit: ${p.name} destroyed ${count} unit(s) @ waypoint ${wp}`);
  }
}
