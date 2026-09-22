/**
 * CreditsExceedCondition — 玩家资金超过阈值。
 *
 * 事件 CreditsExceed：params[1] = 阈值（credits 绝对值）。
 *
 * 由 game/trigger/condition/CreditsExceedCondition.ts.js 重写为 TS。
 */
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 本组已写

export class CreditsExceedCondition extends TriggerCondition {
  /** 资金阈值。 */
  readonly threshold: number;

  constructor(event: any, trigger: any) {
    super(event, trigger);
    this.threshold = Number(event.params[1]);
  }

  check(_game: any, _events?: any): boolean {
    return !!this.player && this.player.credits > this.threshold;
  }
}
