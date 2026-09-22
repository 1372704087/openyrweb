/**
 * SpiedByCondition — 目标被指定阵营渗透。
 *
 * 事件 SpiedBy：BuildingInfiltration 且 target 在 targets 内；
 * houseId=-1 表示任意阵营。
 *
 * 由 game/trigger/condition/SpiedByCondition.ts.js 重写为 TS。
 */
import { EventType } from "game/event/EventType"; // 孪生
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 本组已写

export class SpiedByCondition extends TriggerCondition {
  /** 渗透方国家 id；-1 = 任意。 */
  readonly houseId: number;

  constructor(event: any, trigger: any) {
    super(event, trigger);
    this.houseId = Number(this.event.params[1]);
  }

  check(_game: any, events: any[]): any[] {
    return events
      .filter((ev) => {
        if (ev.type !== EventType.BuildingInfiltration) return false;
        if (!this.targets.includes(ev.target)) return false;
        if (this.houseId !== -1 && ev.source.owner.country?.id !== this.houseId) return false;
        return true;
      })
      .map((ev) => ev.target);
  }
}
