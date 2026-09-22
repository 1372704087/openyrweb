/**
 * TimerSetExecutor — 设置计时器动作。
 *
 * 动作 27: TimerSet — 将场景倒计时设为指定秒数。
 *
 * 由 game/trigger/executor/TimerSetExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 参数：params[1] = 秒数。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 未转换（any-shim）

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TimerSetExecutor extends TriggerExecutor {
  /**
   * 执行：countdownTimer.setSeconds(params[1])。
   *
   * @param world 世界上下文。
   */
  execute(world: any): void {
    world.countdownTimer.setSeconds(Number(this.action.params[1]));
  }
}
