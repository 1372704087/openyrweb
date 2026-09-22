/**
 * ForceTriggerExecutor — 强制触发指定编号的触发器。
 *
 * params[1] 为目标触发器编号，经 world.triggers.forceTrigger
 * 立即触发（与孪生参数顺序一致）。
 *
 * 由 game/trigger/executor/ForceTriggerExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ForceTriggerExecutor extends TriggerExecutor {
  /** 强制触发 params[1] 编号的触发器。 */
  execute(world: any): void {
    const triggerId = this.action.params[1];
    world.triggers.forceTrigger(triggerId, world);
  }
}
