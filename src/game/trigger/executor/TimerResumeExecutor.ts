/**
 * TimerResumeExecutor — 恢复被暂停的任务计时器（动作 105）。
 *
 * 复用 CountdownTimer.start()（与 TimerStart 同实现路径），使暂停
 * 后的计时器继续走。
 *
 * 由 game/trigger/executor/TimerResumeExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TimerResumeExecutor extends TriggerExecutor {
  /** 恢复倒计时。 */
  execute(world: any): void {
    world.countdownTimer.start();
  }
}
