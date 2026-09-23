/**
 * RandomDelayCondition — 随机延迟后触发（永不通过的占位 NoEvent 的兄弟）。
 *
 * 事件 RandomDelay：首帧按 params[1]×(50%~150%) 随机秒数生成 timerTicks，
 * 之后每帧 elapsedTicks++，超过 timerTicks 才为 true。reset() 清空以便重掷。
 *
 * 由 game/trigger/condition/RandomDelayCondition.ts.js 重写为 TS。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { GameSpeed } from "game/GameSpeed"; // 孪生
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 本组已写

export class RandomDelayCondition extends TriggerCondition {
  /** 已流逝帧数。 */
  private elapsedTicks = 0;
  /** 懒生成的随机延迟阈值 tick（undefined = 尚未生成）。 */
  private timerTicks?: number;

  constructor(...args: any[]) {
    super(args[0], args[1]);
    this.elapsedTicks = 0;
  }

  check(game: any): boolean {
    if (this.timerTicks === undefined) {
      // 首次 check 掷骰：params[1] 秒 × 50%~150% → tick
      this.timerTicks =
        Math.floor((game.generateRandomInt(50, 150) / 100) * Number(this.event.params[1])) *
        GameSpeed.BASE_TICKS_PER_SECOND;
    }
    return this.elapsedTicks++ > this.timerTicks;
  }

  /** 命中后由 TriggerManager 调用：下次重新掷骰。 */
  reset(): void {
    this.timerTicks = undefined;
    this.elapsedTicks = 0;
  }
}
