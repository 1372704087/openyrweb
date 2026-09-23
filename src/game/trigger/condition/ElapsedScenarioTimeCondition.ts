/**
 * ElapsedScenarioTimeCondition — 场景已流逝时间达到阈值。
 *
 * 事件 ElapsedScenarioTime：params[1] = 秒数；构造时换算为 tick
 * （BASE_TICKS_PER_SECOND），check 为 currentTick > timerTicks。
 *
 * 由 game/trigger/condition/ElapsedScenarioTimeCondition.ts.js 重写为 TS。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { GameSpeed } from "game/GameSpeed"; // 孪生
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 本组已写

export class ElapsedScenarioTimeCondition extends TriggerCondition {
  /** 阈值 tick = params[1] 秒 × BASE_TICKS_PER_SECOND。 */
  readonly timerTicks: number;

  constructor(event: any, trigger: any) {
    super(event, trigger);
    this.timerTicks = Number(this.event.params[1]) * GameSpeed.BASE_TICKS_PER_SECOND;
  }

  check(game: any): boolean {
    return game.currentTick > this.timerTicks;
  }
}
