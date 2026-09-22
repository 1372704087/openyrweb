/**
 * CreateBuildingExecutor — 创建建筑动作。
 *
 * 动作 125: CreateBuilding — 为触发器所属阵营在指定路径点生成建筑。
 * 参数约定：params[1]=建筑类型名，params[6]=路径点（与其它路径点动作一致）。
 * 参考临时源码枚举 CreateBuilding=125；临时源码未实现，本工程给出可用实现。
 *
 * 由 game/trigger/executor/CreateBuildingExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { ObjectType } from "engine/type/ObjectType"; // 孪生
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class CreateBuildingExecutor extends TriggerExecutor {
  /**
   * 解析阵营名/索引到 Player（与 BlackoutRadarExecutor 同序）。
   *
   * @param world 世界上下文。
   * @param name 阵营名或数字串。
   * @returns 匹配玩家或 undefined。
   */
  resolveHousePlayer(world: any, name: any): any {
    if (!name) return void 0;
    const s = String(name).trim();
    if (!s) return void 0;
    let p = world.housePlayers.get(s);
    if (p) return p;
    if (/^\d+$/.test(s)) {
      const h = world.campaignHouses && world.campaignHouses[Number(s)];
      if (h) p = world.housePlayers.get(h.name);
      if (p) return p;
    }
    p = world.getAllPlayers().find((q: any) => !q.defeated && q.country?.name === s);
    if (p) return p;
    const lower = s.toLowerCase();
    for (const [k, v] of world.housePlayers) if (k.toLowerCase() === lower) return v;
    p = world
      .getAllPlayers()
      .find(
        (q: any) =>
          q.name === s ||
          (q.scenarioAliases || []).some((a: any) => String(a).toLowerCase() === lower),
      );
    return p;
  }

  /**
   * 执行：在路径点创建并归属建筑，开启电力。
   *
   * @param world 世界上下文。
   */
  execute(world: any): void {
    const buildingName = String(this.action.params[1] || "").trim();
    if (!buildingName || "0" === buildingName || /^(?:none|<none>)$/i.test(buildingName)) {
      console.warn(`CreateBuilding has no building id (${this.getDebugName()}).`);
      return;
    }
    const waypoint = Number(this.action.params[6]) || 0;
    const tile = world.map.getTileAtWaypoint(waypoint);
    if (!tile) {
      console.warn(
        `CreateBuilding: no valid location for waypoint ${waypoint}. Skipping ${this.getDebugName()}.`,
      );
      return;
    }
    const owner = this.resolveHousePlayer(world, this.trigger.houseName);
    if (!owner) {
      console.warn(`Invalid house "${this.trigger.houseName}" for ${this.getDebugName()}.`);
      return;
    }
    if (!world.rules.hasObject(buildingName, ObjectType.Building)) {
      console.warn(`CreateBuilding: building "${buildingName}" not found in rules.`);
      return;
    }
    try {
      const obj = world.createObject(ObjectType.Building, buildingName);
      world.changeObjectOwner(obj, owner);
      obj.poweredTrait?.setTurnedOn(!0);
      world.spawnObject(obj, tile);
      console.warn(
        `[OpenYRWeb] CreateBuilding: "${buildingName}" (house=${owner.name}, waypoint=${waypoint}) @ tick ${world.currentTick}`,
      );
    } catch (err: any) {
      console.warn(
        `CreateBuilding failed for "${buildingName}" @ waypoint ${waypoint}: ${err && err.message || err}`,
      );
    }
  }
}
