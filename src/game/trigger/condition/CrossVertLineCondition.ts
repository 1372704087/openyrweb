/**
 * CrossVertLineCondition — 单位穿过垂直线条件。
 *
 * 事件 CrossesVerticalLine：本帧 EnterTile 中，非空军且 rx 与任一目标 rx
 * 相同的事件，映射为进入的 tile 目标数组。houseId=-1 表示任意阵营。
 *
 * 由 game/trigger/condition/CrossVertLineCondition.ts.js 重写为 TS。
 */
import { EventType } from "game/event/EventType"; // 孪生
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 孪生
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 本组已写

export class CrossVertLineCondition extends TriggerCondition {
  /** 限定阵营国家 id；-1 = 任意。 */
  readonly houseId: number;

  constructor(event: any, trigger: any) {
    super(event, trigger);
    this.houseId = Number(this.event.params[1]);
  }

  check(_game: any, events: any[]): any[] {
    return events
      .filter((ev) => {
        if (ev.type !== EventType.EnterTile) return false;
        // 空军不参与地面划线
        if (ev.source.zone === ZoneType.Air) return false;
        // 垂直线：rx 相同
        if (!this.targets.some((t) => t.rx === ev.target.rx)) return false;
        // 阵营过滤
        if (this.houseId !== -1 && ev.source.owner.country?.id !== this.houseId) return false;
        return true;
      })
      .map((ev) => ev.target);
  }
}
