/**
 * HealthBelowCombatCondition — 战斗伤害首次跌破阈值。
 *
 * 工厂按事件注入 threshold：FirstDamaged=100 / HalfHealth=50 / QuarterHealth=25。
 * 仅看 InflictDamage，且 currentHealth < threshold ≤ prevHealth（跨阈向下）。
 *
 * 由 game/trigger/condition/HealthBelowCombatCondition.ts.js 重写为 TS。
 */
import { EventType } from "game/event/EventType"; // 孪生
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 本组已写

export class HealthBelowCombatCondition extends TriggerCondition {
  /** 生命百分比阈值（100/50/25）。 */
  readonly threshold: number;

  constructor(event: any, trigger: any, threshold: number) {
    super(event, trigger);
    this.threshold = threshold;
  }

  check(_game: any, events: any[]): any[] {
    return events
      .filter((ev) => {
        if (ev.type !== EventType.InflictDamage) return false;
        const target = ev.target;
        if (!target.isTechno() || !this.targets.includes(target)) return false;
        // 本帧跌破且上一帧仍在阈值之上（含等于）
        return ev.currentHealth < this.threshold && ev.prevHealth > this.threshold;
      })
      .map((ev) => ev.target);
  }
}
