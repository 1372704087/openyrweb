/**
 * DestroyedAllCondition — 指定阵营全灭触发条件。
 *
 * 监听 ObjectDestroy：被毁 Techno 的 owner.country.id 等于
 * params[1]（houseId），且该 owner 已无任何存活对象 → 置
 * allDestroyed 并返回 true；此后恒 true（粘滞）。
 *
 * 由 game/trigger/condition/DestroyedAllCondition.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 已转换
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
export class DestroyedAllCondition extends TriggerCondition {
  /** 一旦判定全灭则粘滞为 true。 */
  allDestroyed: boolean;
  /** 目标阵营 country.id（params[1]）。 */
  houseId: number;

  constructor(event: any, trigger: any) {
    super(event, trigger);
    this.allDestroyed = false;
    this.houseId = Number(event.params[1]);
  }

  /** 已全灭或本次事件满足"同 house 最后一个对象被毁"则 true。 */
  check(_world: any, events: any[]): boolean {
    return (
      !!this.allDestroyed ||
      (!!events.some((event) => {
        if (event.type !== EventType.ObjectDestroy) return false;
        const target = event.target;
        return (
          !(!target.isTechno() || target.owner.country?.id !== this.houseId) &&
          !target.owner.getOwnedObjects(true).length
        );
      }) &&
        (this.allDestroyed = true))
    );
  }
}
