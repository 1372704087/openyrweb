/**
 * SpyEnteringAsHouseCondition — 指定阵营间谍进入触发条件。
 *
 * params[1] = houseId（-1 表示任意阵营）。筛选 BuildingInfiltration
 * 事件：target 须在本触发器 targets 中；若 houseId!==-1，还须
 * source.disguiseTrait 的伪装所属 country.id 等于 houseId。
 * 返回命中的 target 列表。
 *
 * 由 game/trigger/condition/SpyEnteringAsHouseCondition.ts.js 重写
 * 为 TS（行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 已转换
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
export class SpyEnteringAsHouseCondition extends TriggerCondition {
  /** 间谍所属阵营 country.id（params[1]，-1=任意）。 */
  houseId: number;

  constructor(event: any, trigger: any) {
    super(event, trigger);
    this.houseId = Number(event.params[1]);
  }

  /** 筛选 BuildingInfiltration 且伪装阵营匹配的目标。 */
  check(_world: any, events: any[]): any[] {
    return events
      .filter((event) => {
        if (event.type !== EventType.BuildingInfiltration) return false;
        const target = event.target;
        return (
          !!this.targets.includes(target) &&
          (this.houseId === -1 ||
            event.source.disguiseTrait?.getDisguise()?.owner?.country?.id === this.houseId)
        );
      })
      .map((event) => event.target);
  }
}
