/**
 * UnloadAllExecutor — 卸载所有运输工具动作。
 *
 * 动作 86: UnloadAll — 使触发器的所属阵营所有运输载具/可进驻建筑卸载乘客。
 * 复用 EvacuateTransportTask（与战斗要塞/生化反应炉同一卸载机制）。
 *
 * 由 game/trigger/executor/UnloadAllExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as EvacuateTransportTaskModule from "game/gameobject/task/EvacuateTransportTask"; // 未转换（any-shim）
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class UnloadAllExecutor extends TriggerExecutor {
  /**
   * 执行：对归属阵营所有载有乘客的运输对象下撤离任务。
   *
   * @param world 世界上下文。
   */
  execute(world: any): void {
    const houseName = String(this.trigger.houseName || "").trim();
    const lowerHouse = houseName.toLowerCase();
    const player =
      world.housePlayers.get(houseName) ||
      world.getAllPlayers().find(
        (p: any) =>
          !p.defeated &&
          (p.country?.name === houseName ||
            p.name === houseName ||
            (p.scenarioAliases || []).some((a: any) => String(a).toLowerCase() === lowerHouse)),
      );
    if (!player) {
      console.warn(`Invalid house "${this.trigger.houseName}" for ${this.getDebugName()}.`);
      return;
    }
    let count = 0;
    for (const obj of player.getOwnedObjects()) {
      if (obj.isDestroyed || !obj.transportTrait || !obj.transportTrait.units.length) continue;
      if (!obj.unitOrderTrait) continue;
      try {
        obj.unitOrderTrait.addTask(
          new (EvacuateTransportTaskModule as any).EvacuateTransportTask(world, !0),
        );
        count++;
      } catch (_) {}
    }
    console.warn(`[OpenYRWeb] UnloadAll: ${player.name}, transports unloaded: ${count}`);
  }
}
