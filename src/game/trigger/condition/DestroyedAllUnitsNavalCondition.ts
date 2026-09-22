/**
 * DestroyedAllUnitsNavalCondition — 指定阵营海军全灭触发条件。
 *
 * 监听 ObjectDestroy：被毁 Vehicle 的 owner.country.id 等于
 * params[1]，且该 owner 已无 naval 属性的 Vehicle → 置
 * allDestroyed 并返回 true；此后粘滞 true。
 *
 * 由 game/trigger/condition/DestroyedAllUnitsNavalCondition.ts.js
 * 重写为 TS（行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { ObjectType } from "engine/type/ObjectType"; // 已转换
import { EventType } from "game/event/EventType"; // 已转换
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
export class DestroyedAllUnitsNavalCondition extends TriggerCondition {
  /** 一旦判定海军全灭则粘滞为 true。 */
  allDestroyed: boolean;
  /** 目标阵营 country.id（params[1]）。 */
  houseId: number;

  constructor(event: any, trigger: any) {
    super(event, trigger);
    this.allDestroyed = false;
    this.houseId = Number(event.params[1]);
  }

  /** 已全灭或同 house 最后一个 naval Vehicle 被毁则 true。 */
  check(_world: any, events: any[]): boolean {
    return (
      !!this.allDestroyed ||
      (!!events.some((event) => {
        if (event.type !== EventType.ObjectDestroy) return false;
        const target = event.target;
        return (
          !(!target.isVehicle() || target.owner.country?.id !== this.houseId) &&
          !target.owner
            .getOwnedObjectsByType(ObjectType.Vehicle, true)
            .filter((obj: any) => obj.rules.naval).length
        );
      }) &&
        (this.allDestroyed = true))
    );
  }
}
