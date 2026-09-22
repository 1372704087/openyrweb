/**
 * NoEventCondition — 永不触发的条件（未实现事件类型的占位）。
 *
 * check 恒 false：用于 TriggerSupport.placeholderEventTypes 中已枚举但
 * 未实现的事件类型，保证触发器可导入但不会误触发。
 *
 * 由 game/trigger/condition/NoEventCondition.ts.js 重写为 TS。
 */
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 本组已写

export class NoEventCondition extends TriggerCondition {
  check(_game: any, _events?: any): boolean {
    return false;
  }
}
