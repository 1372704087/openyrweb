/**
 * DoShroudExecutor — 在路径点制造迷雾（动作 80）。
 *
 * 路径点取 params[6]，回退 params[1]（均 0 基/缺省 0）；半径取
 * params[2]，缺省 3。对触发 house 的 PlayerShroud 调
 * unrevealAround 将该区域标为 Unexplored。路径点无效则 warn。
 *
 * 由 game/trigger/executor/DoShroudExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class DoShroudExecutor extends TriggerExecutor {
  /** 对触发 house 在路径点周围制造迷雾。 */
  execute(world: any): void {
    const waypoint = Number(this.action.params[6]) || Number(this.action.params[1]) || 0;
    const tile = world.map.getTileAtWaypoint(waypoint);
    if (tile) {
      const radius = Number(this.action.params[2]) || 3;
      const player = world
        .getAllPlayers()
        .find((p: any) => !p.defeated && p.country?.name === this.trigger.houseName);
      if (player) world.mapShroudTrait.getPlayerShroud(player)?.unrevealAround(tile, radius);
    } else
      console.warn(`No valid location found for waypoint ${waypoint}. ` + `Skipping action ${this.getDebugName()}.`);
  }
}
