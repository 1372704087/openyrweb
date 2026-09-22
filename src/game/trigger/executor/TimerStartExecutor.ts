/**
 * TimerStartExecutor — 启动任务倒计时。
 *
 * world.countdownTimer.start()；与孪生一致，无其它副作用。
 *
 * 由 game/trigger/executor/TimerStartExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TimerStartExecutor extends TriggerExecutor {
  /** 启动倒计时。 */
  execute(world: any): void {
    world.countdownTimer.start();
  }
}
