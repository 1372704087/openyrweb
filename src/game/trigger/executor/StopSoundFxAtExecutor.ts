/**
 * StopSoundFxAtExecutor — 在路径点停止音效动作。
 *
 * 动作 116: StopSoundsAt — 停止指定路径点的空间音效。
 *
 * 由 game/trigger/executor/StopSoundFxAtExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 参数：params[6] = 路径点。
 */
import * as TriggerStopSoundFxEventModule from "game/event/TriggerStopSoundFxEvent"; // 孪生
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class StopSoundFxAtExecutor extends TriggerExecutor {
  /**
   * 执行：在目标格派发 TriggerStopSoundFxEvent。
   *
   * @param world 世界上下文。
   */
  execute(world: any): void {
    const waypoint = this.action.params[6];
    const tile = world.map.getTileAtWaypoint(waypoint);
    if (!tile) {
      console.warn(
        `No valid location found for waypoint ${waypoint}. ` +
          `Skipping action ${this.getDebugName()}.`,
      );
      return;
    }
    world.events.dispatch(new (TriggerStopSoundFxEventModule as any).TriggerStopSoundFxEvent(tile));
  }
}
