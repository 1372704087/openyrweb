/**
 * TimerShortenExecutor — 缩短任务倒计时。
 *
 * 动作 TimerShorten：addSeconds(-params[1])，负数秒数缩短剩余时间。
 *
 * 由 game/trigger/executor/TimerShortenExecutor.ts.js 重写为 TS。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TimerShortenExecutor extends TriggerExecutor {
  execute(game: any): void {
    game.countdownTimer.addSeconds(-Number(this.action.params[1]));
  }
}
