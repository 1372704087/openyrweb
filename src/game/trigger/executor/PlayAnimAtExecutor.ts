/**
 * PlayAnimAtExecutor — 在路径点播放动画动作。
 *
 * 动作 41: PlayAnimAt — 按动画索引在路径点播放规则动画。
 *
 * 由 game/trigger/executor/PlayAnimAtExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 参数：params[1]=动画索引，params[6]=路径点。
 */
import * as TriggerAnimEventModule from "game/event/TriggerAnimEvent"; // 孪生
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class PlayAnimAtExecutor extends TriggerExecutor {
  /**
   * 执行：解析动画名并在目标格派发 TriggerAnimEvent。
   *
   * @param world 世界上下文。
   */
  execute(world: any): void {
    const action = this.action;
    const animIndex = Number(action.params[1]);
    const animName = world.rules.getAnimationName(animIndex);
    if (void 0 === animName) {
      console.warn(`No animation found for index "${animIndex}". Skipping action ` + this.getDebugName());
      return;
    }
    const waypoint = action.params[6];
    const tile = world.map.getTileAtWaypoint(waypoint);
    if (!tile) {
      console.warn(
        `No valid location found for waypoint ${waypoint}. ` +
          `Skipping action ${this.getDebugName()}.`,
      );
      return;
    }
    world.events.dispatch(new (TriggerAnimEventModule as any).TriggerAnimEvent(animName, tile));
  }
}
