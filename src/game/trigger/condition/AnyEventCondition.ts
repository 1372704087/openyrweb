/**
 * AnyEventCondition — 任意事件条件（始终满足）。
 *
 * 由 game/trigger/condition/AnyEventCondition.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 对应 TriggerEventType.AnyEvent=8：check 恒 true，每次评估都通过。
 */
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
export class AnyEventCondition extends TriggerCondition {
  /**
   * 检查条件——恒满足。
   *
   * @returns 恒为 true（与孪生一致）。
   */
  check(_context?: any, _events?: any): boolean {
    return !0;
  }
}
