/**
 * PlaySoundFxRandomExecutor — 随机播放音效动作。
 *
 * 动作 100: PlaySoundFxRandom — 从参数中随机挑选一个音效播放。
 * 参数: params[1..7] = 候选音效名列表（"0" 视为空）。
 * 与原版一致，随机选择并派发 TriggerSoundFxEvent。
 *
 * 由 game/trigger/executor/PlaySoundFxRandomExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as TriggerSoundFxEventModule from "game/event/TriggerSoundFxEvent"; // 孪生
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class PlaySoundFxRandomExecutor extends TriggerExecutor {
  /**
   * 执行：过滤候选后随机选一个音效派发事件。
   *
   * @param world 世界上下文（可用 prng 时优先用）。
   */
  execute(world: any): void {
    const sounds = this.action.params.slice(1).filter((s: any) => s && "0" !== s);
    if (!sounds.length) return;
    const idx = world.prng
      ? world.prng.generateRandomInt(0, sounds.length - 1)
      : Math.floor(Math.random() * sounds.length);
    world.events.dispatch(new (TriggerSoundFxEventModule as any).TriggerSoundFxEvent(sounds[idx]));
  }
}
