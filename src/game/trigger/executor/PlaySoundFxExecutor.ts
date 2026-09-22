/**
 * PlaySoundFxExecutor — 全局播放音效动作。
 *
 * 动作 19: PlaySoundFx — 无位置全局播放音效。
 *
 * 由 game/trigger/executor/PlaySoundFxExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 参数：params[1]=音效 ID（tile 省略为 undefined，与孪生一致）。
 */
import * as TriggerSoundFxEventModule from "game/event/TriggerSoundFxEvent"; // 孪生
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class PlaySoundFxExecutor extends TriggerExecutor {
  /**
   * 执行：派发无位置的 TriggerSoundFxEvent。
   *
   * @param world 世界上下文。
   */
  execute(world: any): void {
    world.events.dispatch(
      new (TriggerSoundFxEventModule as any).TriggerSoundFxEvent(this.action.params[1]),
    );
  }
}
