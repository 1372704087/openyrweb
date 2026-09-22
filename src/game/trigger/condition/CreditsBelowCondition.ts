/**
 * CreditsBelowCondition — 资金低于阈值条件。
 *
 * 由 game/trigger/condition/CreditsBelowCondition.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 对应 TriggerEventType.CreditsBelow=52：threshold 取 params[1]；
 * 未解析到 player 时恒 false，否则比较 player.credits < threshold。
 */
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
export class CreditsBelowCondition extends TriggerCondition {
  /** 资金阈值（params[1]）。 */
  threshold: number;

  constructor(event: any, trigger: any) {
    super(event, trigger);
    this.threshold = Number(event.params[1]);
  }

  /**
   * 检查归属玩家资金是否低于阈值。
   *
   * @returns 有 player 且 credits < threshold 时为 true。
   */
  check(_context?: any, _events?: any): boolean {
    return !!this.player && this.player.credits < this.threshold;
  }
}
