/**
 * DestroyTriggerExecutor — 从运行时移除指定触发器。
 *
 * 动作 DestroyTrigger：params[1] = trigger id，转发到 TriggerManager.destroyTrigger。
 *
 * 由 game/trigger/executor/DestroyTriggerExecutor.ts.js 重写为 TS。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写

/* eslint-disable @typescript-eslint/no-explicit-any */
export class DestroyTriggerExecutor extends TriggerExecutor {
  execute(game: any): void {
    const triggerId = this.action.params[1];
    game.triggers.destroyTrigger(triggerId);
  }
}
