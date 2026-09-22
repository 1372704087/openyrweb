/**
 * DoUnshroudExecutor — 消除迷雾动作。
 *
 * 动作 81: DoUnshroud — 在指定路径点周围对触发阵营揭示地图。
 * 参数: params[6] = 路径点编号(AZ 编码), params[1] = 揭示半径(格, 0 用默认 3)。
 * 实现: 复用 MapShroud.revealAround 将该区域标为 Explored。
 *
 * 由 game/trigger/executor/DoUnshroudExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 注：孪生 waypoint 回退链为 params[6] || params[1] || 0，半径取
 * params[2]（缺省 3），与文件头注释中的 params[1] 描述略有出入——
 * 以代码为准保持锁步。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class DoUnshroudExecutor extends TriggerExecutor {
  /**
   * 执行：对触发阵营在路径点周围揭示迷雾。
   *
   * @param world 世界上下文。
   */
  execute(world: any): void {
    const waypoint = Number(this.action.params[6]) || Number(this.action.params[1]) || 0;
    const tile = world.map.getTileAtWaypoint(waypoint);
    if (!tile) {
      console.warn(
        `No valid location found for waypoint ${waypoint}. ` +
          `Skipping action ${this.getDebugName()}.`,
      );
      return;
    }
    const radius = Number(this.action.params[2]) || 3;
    const player = world
      .getAllPlayers()
      .find((p: any) => !p.defeated && p.country?.name === this.trigger.houseName);
    if (player) world.mapShroudTrait.getPlayerShroud(player)?.revealAround(tile, radius);
  }
}
