/**
 * TextNotificationExecutor — 显示非本地化文本通知（动作 83）。
 *
 * 派发 TriggerTextEvent(params[1])，与 TextTrigger(11) 在引擎内
 * 走同一事件通道。
 *
 * 由 game/trigger/executor/TextNotificationExecutor.ts.js 重写为
 * TS（行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerTextEvent } from "game/event/TriggerTextEvent"; // 已转换
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TextNotificationExecutor extends TriggerExecutor {
  /** 派发文本通知事件。 */
  execute(world: any): void {
    world.events.dispatch(new TriggerTextEvent(this.action.params[1]));
  }
}
