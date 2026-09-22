/**
 * DestroyedUnitsCondition — 摧毁指定数量单位条件。
 *
 * 由 game/trigger/condition/DestroyedUnitsCondition.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 对应 TriggerEventType.DestroyedUnits=16：threshold 取 params[1]；
 * 每次 check 累计 ObjectDestroy 中属于 houseId 的单位数，达到阈值后
 * 粘性返回 true。无 player 时恒 false。注意：孪生未在构造中写入
 * houseId，比较时为 undefined——此处保持同样未初始化字段以锁步。
 */
import { EventType } from "game/event/EventType"; // 孪生
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
export class DestroyedUnitsCondition extends TriggerCondition {
  /** 已累计摧毁计数。 */
  count: number;
  /** 需要摧毁的数量阈值（params[1]）。 */
  threshold: number;
  /** 目标阵营国家 id；孪生构造未赋值，运行时可能为 undefined。 */
  houseId: any;

  constructor(event: any, trigger: any) {
    super(event, trigger);
    this.count = 0;
    this.threshold = Number(event.params[1]);
  }

  /**
   * 累计并检查是否达到摧毁阈值。
   *
   * @returns 无 player 为 false；已达标或本批累计后达标为 true。
   */
  check(_context?: any, events?: any[]): boolean {
    if (!this.player) return !1;
    if (this.count >= this.threshold) return !0;
    for (const ev of events)
      if (ev.type === EventType.ObjectDestroy) {
        const target = ev.target;
        if (target.isUnit() && target.owner.country?.id === this.houseId) this.count++;
      }
    return this.count >= this.threshold;
  }
}
