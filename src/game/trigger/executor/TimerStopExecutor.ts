/**
 * TimerStopExecutor — 停止计时器动作。
 *
 * 动作 24: TimerStop — 停止场景倒计时。
 *
 * 由 game/trigger/executor/TimerStopExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TimerStopExecutor extends TriggerExecutor {
  /**
   * 执行：countdownTimer.stop()。
   *
   * @param world 世界上下文。
   */
  execute(world: any): void {
    world.countdownTimer.stop();
  }
}
