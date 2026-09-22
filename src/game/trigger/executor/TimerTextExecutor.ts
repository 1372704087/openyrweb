/**
 * TimerTextExecutor — 设置倒计时显示文案。
 *
 * 动作 TimerText：countdownTimer.text = params[1]（原始字符串参数）。
 *
 * 由 game/trigger/executor/TimerTextExecutor.ts.js 重写为 TS。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TimerTextExecutor extends TriggerExecutor {
  execute(game: any): void {
    game.countdownTimer.text = this.action.params[1];
  }
}
