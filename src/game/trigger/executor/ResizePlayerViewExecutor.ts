/**
 * ResizePlayerViewExecutor — 调整玩家视野动作。
 *
 * 动作 40: ResizePlayerView — 用参数覆盖本地视野矩形。
 *
 * 由 game/trigger/executor/ResizePlayerViewExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 参数：params[2..5] = x, y, width, height（Number 后写入 mapBounds）。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ResizePlayerViewExecutor extends TriggerExecutor {
  /**
   * 执行：更新 mapBounds 本地矩形。
   *
   * @param world 世界上下文。
   */
  execute(world: any): void {
    const [x, y, width, height] = this.action.params.slice(2, 6).map(Number);
    world.map.mapBounds.updateRawLocalSize({ x, y, width, height });
  }
}
