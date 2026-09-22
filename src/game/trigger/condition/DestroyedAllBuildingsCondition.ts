/**
 * DestroyedAllBuildingsCondition — 指定阵营全部建筑被摧毁。
 *
 * 事件 DestroyedAllBuildings：一旦观测到该阵营（houseId）建筑全灭
 * （ObjectDestroy 且 owner.buildings.size===0），置 allDestroyed 锁存。
 *
 * 由 game/trigger/condition/DestroyedAllBuildingsCondition.ts.js 重写为 TS。
 */
import { EventType } from "game/event/EventType"; // 孪生
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 本组已写

export class DestroyedAllBuildingsCondition extends TriggerCondition {
  /** 一旦全灭则锁存为 true（后续帧恒真）。 */
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
      if (!target.isBuilding()) return false;
      if (target.owner.country?.id !== this.houseId) return false;
      // 该次摧毁后建筑集合已空 → 全灭
      return !target.owner.buildings.size;
    });
    if (hit) {
      this.allDestroyed = true;
      return true;
    }
    return false;
  }
}
