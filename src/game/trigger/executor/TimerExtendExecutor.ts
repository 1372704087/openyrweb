/**
 * TimerExtendExecutor — 任务计时器追加秒数。
 *
 * world.countdownTimer.addSeconds(params[1])；与孪生一致，无其它
 * 副作用。
 *
 * 由 game/trigger/executor/TimerExtendExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TimerExtendExecutor extends TriggerExecutor {
  /** 为倒计时追加 params[1] 秒。 */
  execute(world: any): void {
    world.countdownTimer.addSeconds(Number(this.action.params[1]));
  }
}
