/**
 * DestroyedAllUnitsLandCondition — 指定阵营全部陆地单位被摧毁。
 *
 * 事件 DestroyedAllUnitsLand：ObjectDestroy 后若 owner 已无 Vehicle/Infantry
 * 中非 naval 单位，则锁存 allDestroyed。
 *
 * 由 game/trigger/condition/DestroyedAllUnitsLandCondition.ts.js 重写为 TS。
 */
import { ObjectType } from "engine/type/ObjectType"; // 孪生
import { EventType } from "game/event/EventType"; // 孪生
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 本组已写

export class DestroyedAllUnitsLandCondition extends TriggerCondition {
  /** 一旦全灭则锁存为 true。 */
  private allDestroyed = false;
  /** 目标阵营国家 id。 */
  readonly houseId: number;

  constructor(event: any, trigger: any) {
    super(event, trigger);
    this.allDestroyed = false;
    this.houseId = Number(event.params[1]);
  }

  check(_game: any, events: any[]): boolean {
    if (this.allDestroyed) return true;
    const hit = events.some((ev) => {
      if (ev.type !== EventType.ObjectDestroy) return false;
      const target = ev.target;
      if (!target.isUnit()) return false;
      if (target.owner.country?.id !== this.houseId) return false;
      return !this.hasLandUnitsLeft(target.owner);
    });
    if (hit) {
      this.allDestroyed = true;
      return true;
    }
    return false;
  }

  /** owner 是否仍有陆地单位（Vehicle/Infantry 且非 naval）。 */
  private hasLandUnitsLeft(owner: any): boolean {
    for (const type of [ObjectType.Vehicle, ObjectType.Infantry]) {
      if (owner.getOwnedObjectsByType(type, true).filter((o: any) => !o.rules.naval).length) {
        return true;
      }
    }
    return false;
  }
}
