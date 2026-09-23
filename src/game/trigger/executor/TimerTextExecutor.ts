/**
 * TimerTextExecutor — 设置倒计时显示文案。
 *
 * 动作 TimerText：countdownTimer.text = params[1]（原始字符串参数）。
 *
 * 由 game/trigger/executor/TimerTextExecutor.ts.js 重写为 TS。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TimerTextExecutor extends TriggerExecutor {
  execute(game: any): void {
    game.countdownTimer.text = this.action.params[1];
  }
}
