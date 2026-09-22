/**
 * TextTriggerExecutor — 显示文本动作。
 *
 * 动作 11: TextTrigger — 派发触发器文本事件（本地化消息）。
 *
 * 由 game/trigger/executor/TextTriggerExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 参数：params[1] = 文本/本地化键。
 */
import * as TriggerTextEventModule from "game/event/TriggerTextEvent"; // 孪生
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TextTriggerExecutor extends TriggerExecutor {
  /**
   * 执行：派发 TriggerTextEvent(params[1])。
   *
   * @param world 世界上下文。
   */
  execute(world: any): void {
    world.events.dispatch(new (TriggerTextEventModule as any).TriggerTextEvent(this.action.params[1]));
  }
}
