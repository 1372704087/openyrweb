/**
 * TimerPauseExecutor — 暂停任务计时器。
 *
 * 动作 104: TimerPause — 暂停任务计时器（保留剩余时间，仅停止递减）。
 * 复用 CountdownTimer.stop()（其仅置 running=false，ticks 保留）。
 *
 * 由 game/trigger/executor/TimerPauseExecutor.ts.js 重写为 TS。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TimerPauseExecutor extends TriggerExecutor {
  execute(game: any): void {
    game.countdownTimer.stop();
  }
}
