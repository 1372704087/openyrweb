/**
 * ElapsedTimeCondition — 场景经过时间触发条件。
 *
 * 构造时 timerTicks = params[1] 秒 × GameSpeed.BASE_TICKS_PER_SECOND。
 * 每次 check 对 elapsedTicks 后增比较，超过 timerTicks 即 true
 * （严格大于）。reset 将 elapsedTicks 清零（触发器重置时用）。
 *
 * 由 game/trigger/condition/ElapsedTimeCondition.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { GameSpeed } from "game/GameSpeed"; // 已转换
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ElapsedTimeCondition extends TriggerCondition {
  /** 已累计 tick（后增比较）。 */
  elapsedTicks: number;
  /** 阈值 tick 数（params[1] 秒 × 每秒 tick）。 */
  timerTicks: number;

  constructor(event: any, trigger: any) {
    super(event, trigger);
    this.elapsedTicks = 0;
    this.timerTicks = Number(this.event.params[1]) * GameSpeed.BASE_TICKS_PER_SECOND;
  }

  /** 后增 elapsedTicks 并与 timerTicks 严格比较。 */
  check(_world?: any): boolean {
    return this.elapsedTicks++ > this.timerTicks;
  }

  /** 重置计时（触发器 reset 钩子）。 */
  reset(): void {
    this.elapsedTicks = 0;
  }
}
