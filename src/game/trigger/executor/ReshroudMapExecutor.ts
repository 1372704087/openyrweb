/**
 * ReshroudMapExecutor — 重新迷雾动作。
 *
 * 动作 51: ReshroudMap — 对全部作战方重置地图迷雾。
 *
 * 由 game/trigger/executor/ReshroudMapExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ReshroudMapExecutor extends TriggerExecutor {
  /**
   * 执行：对每个 combatant 调用 mapShroudTrait.resetShroud。
   *
   * @param world 世界上下文。
   */
  execute(world: any): void {
    for (const player of world.getCombatants()) world.mapShroudTrait.resetShroud(player, world);
  }
}
