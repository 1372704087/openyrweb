/**
 * CreditsExceedCondition — 玩家资金超过阈值。
 *
 * 事件 CreditsExceed：params[1] = 阈值（credits 绝对值）。
 *
 * 由 game/trigger/condition/CreditsExceedCondition.ts.js 重写为 TS。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
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
