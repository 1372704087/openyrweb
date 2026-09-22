/**
 * PickupCrateAnyCondition — 拾取任意箱子条件。
 *
 * 由 game/trigger/condition/PickupCrateAnyCondition.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 对应 TriggerEventType.PickupCrateAny=50：本批存在 CratePickup 即 true。
 */
import { EventType } from "game/event/EventType"; // 孪生
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
export class PickupCrateAnyCondition extends TriggerCondition {
  /**
   * 检查是否拾取了任意箱子。
   *
   * @returns 存在 CratePickup 事件为 true。
   */
  check(_context?: any, events?: any[]): boolean {
    return events.some((ev) => ev.type === EventType.CratePickup);
  }
}
