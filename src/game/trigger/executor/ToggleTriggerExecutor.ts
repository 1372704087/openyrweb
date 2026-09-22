/**
 * ToggleTriggerExecutor — 启用/禁用指定触发器。
 *
 * 第三参 triggerEnable（Enable→true / Disable→false）。
 * execute 调 world.triggers.setTriggerEnabled(params[1], enable)。
 *
 * 由 game/trigger/executor/ToggleTriggerExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ToggleTriggerExecutor extends TriggerExecutor {
  /** true=启用 / false=禁用。 */
  triggerEnable: boolean;

  constructor(action: any, trigger: any, enable: boolean) {
    super(action, trigger);
    this.triggerEnable = enable;
  }

  /** 设置 params[1] 触发器的启用状态。 */
  execute(world: any): void {
    const triggerId = this.action.params[1];
    world.triggers.setTriggerEnabled(triggerId, this.triggerEnable);
  }
}
