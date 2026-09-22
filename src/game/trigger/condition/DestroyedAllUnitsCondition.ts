/**
 * DestroyedAllUnitsCondition — 指定阵营全部单位被摧毁条件。
 *
 * 由 game/trigger/condition/DestroyedAllUnitsCondition.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 对应 TriggerEventType.DestroyedAllUnits=9：监听 ObjectDestroy，
 * 当目标是该 houseId 阵营的单位且该阵营已无 Aircraft/Vehicle/Infantry
 * 存活时置 allDestroyed 并保持 true（粘性）。
 */
import { ObjectType } from "engine/type/ObjectType"; // 孪生
import { EventType } from "game/event/EventType"; // 孪生
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
export class DestroyedAllUnitsCondition extends TriggerCondition {
  /** 一旦满足则粘性保持 true。 */
  allDestroyed: boolean;
  /** 目标阵营国家 id（params[1]）。 */
  houseId: number;

  constructor(event: any, trigger: any) {
    super(event, trigger);
    this.allDestroyed = !1;
    this.houseId = Number(event.params[1]);
  }

  /**
   * 检查本批事件是否导致该阵营单位全灭。
   *
   * @returns 已满足或本批首次满足时为 true。
   */
  check(_context?: any, events?: any[]): boolean {
    return (
      !!this.allDestroyed ||
      (!!events.some((ev) => {
        if (ev.type !== EventType.ObjectDestroy) return !1;
        const target = ev.target;
        return (
          !(!target.isUnit() || target.owner.country?.id !== this.houseId) && !this.hasUnitsLeft(target.owner)
        );
      }) &&
        (this.allDestroyed = !0))
    );
  }

  /** 该玩家是否仍拥有任意空中/车辆/步兵单位。 */
  hasUnitsLeft(owner: any): boolean {
    for (const type of [ObjectType.Aircraft, ObjectType.Vehicle, ObjectType.Infantry]) {
      if (owner.getOwnedObjectsByType(type, !0).length) return !0;
    }
    return !1;
  }
}
