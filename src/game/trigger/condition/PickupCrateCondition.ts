/**
 * PickupCrateCondition — 拾取指定箱子条件。
 *
 * 由 game/trigger/condition/PickupCrateCondition.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 对应 TriggerEventType.PickupCrate=49：过滤 CratePickup 且拾取者
 * （event.source）在标签 targets 内；返回拾取者列表。
 */
import { EventType } from "game/event/EventType"; // 孪生
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
export class PickupCrateCondition extends TriggerCondition {
  /**
   * 检查是否由指定目标拾取箱子。
   *
   * @returns 命中的拾取者数组。
   */
  check(_context?: any, events?: any[]): any[] {
    return events
      .filter((ev) => ev.type === EventType.CratePickup && this.targets.includes(ev.source))
      .map((ev) => ev.source);
  }
}
