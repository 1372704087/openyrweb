/**
 * ShroudFxExecutor — 迷雾触发动作。
 *
 * 处理按路径点揭示/延伸黑幕的动作：
 *   18 RevealAllUnits  → 揭示路径点周围（revealTriggerRadius）给所有作战方
 *   31 ExtendShroud    → 逐单元延伸黑幕（同样揭示一圈，半径略小）
 *
 * 由 game/trigger/executor/ShroudFxExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 构造第三参 mode："reveal-units" | "extend-shroud"（工厂注入）。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ShroudFxExecutor extends TriggerExecutor {
  /** 迷雾模式标识（reveal-units / extend-shroud）。 */
  mode: any;

  constructor(action: any, trigger: any, mode: any) {
    super(action, trigger);
    this.mode = mode;
  }

  /**
   * 执行：对全部 combatant 在路径点周围揭示/延伸迷雾。
   *
   * @param world 世界上下文。
   */
  execute(world: any): void {
    const waypoint = Number(this.action.params[1]);
    const tile = world.map.getTileAtWaypoint(waypoint);
    if (!tile) {
      console.warn(
        `No valid location found for waypoint ${waypoint}. Skipping action ${this.getDebugName()}.`,
      );
      return;
    }
    const radius =
      "extend-shroud" === this.mode
        ? Math.max(1, Math.floor(world.rules.general.revealTriggerRadius / 2))
        : world.rules.general.revealTriggerRadius;
    for (const player of world.getCombatants())
      world.mapShroudTrait.getPlayerShroud(player)?.revealAround(tile, radius);
    console.warn(`[OpenYRWeb] ShroudFx ${this.mode}: waypoint ${waypoint}, radius ${radius}`);
  }
}
