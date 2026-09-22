/**
 * HealthBelowAnyCondition — 任意对象生命值跌破阈值条件。
 *
 * 由 game/trigger/condition/HealthBelowAnyCondition.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 对应 FirstDamagedAny/HalfHealthAny/QuarterHealthAny（threshold 由
 * 工厂传入 100/50/25）：过滤 HealthChange，目标是 Techno 且在 targets
 * 内，且本帧从高于阈值跌到低于阈值（穿越边沿）；返回目标列表。
 */
import { EventType } from "game/event/EventType"; // 孪生
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
export class HealthBelowAnyCondition extends TriggerCondition {
  /** 生命百分比阈值（100/50/25）。 */
  threshold: number;

  constructor(event: any, trigger: any, threshold: number) {
    super(event, trigger);
    this.threshold = threshold;
  }

  /**
   * 检查本批事件中是否有生命值跌破阈值。
   *
   * @returns 命中的目标对象数组。
   */
  check(_context?: any, events?: any[]): any[] {
    return events
      .filter((ev) => {
        if (ev.type !== EventType.HealthChange) return !1;
        const target = ev.target;
        return (
          !(!target.isTechno() || !this.targets.includes(target)) &&
          ev.currentHealth < this.threshold &&
          ev.prevHealth > this.threshold
        );
      })
      .map((ev) => ev.target);
  }
}
