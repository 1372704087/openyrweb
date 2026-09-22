/**
 * PlaySoundFxAtExecutor — 在路径点播放音效动作。
 *
 * 动作 99: PlaySoundFxAt — 在指定路径点播放空间音效。
 *
 * 由 game/trigger/executor/PlaySoundFxAtExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 参数：params[1]=音效 ID，params[6]=路径点。
 */
import * as TriggerSoundFxEventModule from "game/event/TriggerSoundFxEvent"; // 孪生
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class PlaySoundFxAtExecutor extends TriggerExecutor {
  /**
   * 执行：在目标格派发 TriggerSoundFxEvent。
   *
   * @param world 世界上下文。
   */
  execute(world: any): void {
    const soundId = this.action.params[1];
    const waypoint = this.action.params[6];
    const tile = world.map.getTileAtWaypoint(waypoint);
    if (!tile) {
      console.warn(
        `No valid location found for waypoint ${waypoint}. ` +
          `Skipping action ${this.getDebugName()}.`,
      );
      return;
    }
    world.events.dispatch(new (TriggerSoundFxEventModule as any).TriggerSoundFxEvent(soundId, tile));
  }
}
