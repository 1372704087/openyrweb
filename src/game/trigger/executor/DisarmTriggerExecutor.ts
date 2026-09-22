/**
 * DisarmTriggerExecutor — 解除触发器动作。
 *
 * 动作 90: DisarmTrigger — 解除指定触发器，使其不再被触发。
 * 复用 TriggerManager.setTriggerEnabled(id, false)（与 DisableTrigger 同路径）。
 * 参数: params[1] = 触发器 ID。
 *
 * 由 game/trigger/executor/DisarmTriggerExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class DisarmTriggerExecutor extends TriggerExecutor {
  /**
   * 执行：禁用 params[1] 对应触发器。
   *
   * @param world 世界上下文。
   */
  execute(world: any): void {
    const triggerId = this.action.params[1];
    world.triggers.setTriggerEnabled(triggerId, !1);
  }
}
