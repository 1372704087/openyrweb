/**
 * DestroyedOrCapturedOrInfiltratedCondition — 摧毁/占领/渗透任一触发。
 *
 * 过滤三类事件：ObjectDestroy、ObjectOwnerChange、
 * BuildingInfiltration；目标须为本触发器 targets 中的 Techno。
 * 返回命中的 target 列表（与 AttackedByAny 同形的多目标 API）。
 *
 * 由
 * game/trigger/condition/DestroyedOrCapturedOrInfiltratedCondition.ts.js
 * 重写为 TS（行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 已转换
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
export class DestroyedOrCapturedOrInfiltratedCondition extends TriggerCondition {
  /** 允许命中的事件类型集合。 */
  eventsFilter: number[] = [
    EventType.ObjectDestroy,
    EventType.ObjectOwnerChange,
    EventType.BuildingInfiltration,
  ];

  /** 筛选命中事件的目标（须为本触发器 targets 中的 Techno）。 */
  check(_world: any, events: any[]): any[] {
    return events
      .filter((event) => {
        if (!this.eventsFilter.includes(event.type)) return false;
        const target = event.target;
        return !(!target.isTechno() || !this.targets.includes(target));
      })
      .map((event) => event.target);
  }
}
