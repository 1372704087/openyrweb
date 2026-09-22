/**
 * DestroyTriggerExecutor — 从运行时移除指定触发器。
 *
 * 动作 DestroyTrigger：params[1] = trigger id，转发到 TriggerManager.destroyTrigger。
 *
 * 由 game/trigger/executor/DestroyTriggerExecutor.ts.js 重写为 TS。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写

/* eslint-disable @typescript-eslint/no-explicit-any */
export class DestroyTriggerExecutor extends TriggerExecutor {
  execute(game: any): void {
    const triggerId = this.action.params[1];
    game.triggers.destroyTrigger(triggerId);
  }
}
