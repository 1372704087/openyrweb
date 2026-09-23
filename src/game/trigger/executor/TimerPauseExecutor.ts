/**
 * TimerPauseExecutor — 暂停任务计时器。
 *
 * 动作 104: TimerPause — 暂停任务计时器（保留剩余时间，仅停止递减）。
 * 复用 CountdownTimer.stop()（其仅置 running=false，ticks 保留）。
 *
 * 由 game/trigger/executor/TimerPauseExecutor.ts.js 重写为 TS。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TimerPauseExecutor extends TriggerExecutor {
  execute(game: any): void {
    game.countdownTimer.stop();
  }
}
