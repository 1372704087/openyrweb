/**
 * RevealAroundWaypointExecutor — 在路径点开雾揭示。
 *
 * 路径点 params[1]；对每个战斗方的 PlayerShroud 调
 * revealAround(tile, rules.general.revealTriggerRadius)。
 * 路径点无效则 warn 跳过。
 *
 * 由 game/trigger/executor/RevealAroundWaypointExecutor.ts.js 重写
 * 为 TS（行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class RevealAroundWaypointExecutor extends TriggerExecutor {
  /** 在路径点按 revealTriggerRadius 向全部战斗方开雾。 */
  execute(world: any): void {
    const waypoint = Number(this.action.params[1]);
    const tile = world.map.getTileAtWaypoint(waypoint);
    if (tile)
      for (const s of world.getCombatants())
        world.mapShroudTrait.getPlayerShroud(s)?.revealAround(tile, world.rules.general.revealTriggerRadius);
    else
      console.warn(`No valid location found for waypoint ${waypoint}. ` + `Skipping action ${this.getDebugName()}.`);
  }
}
