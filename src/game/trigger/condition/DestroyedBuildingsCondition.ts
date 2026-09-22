/**
 * DestroyedBuildingsCondition — 指定阵营建筑摧毁计数触发条件。
 *
 * params[1] 为阈值 threshold。check 先看粘滞 count>=threshold，
 * 否则遍历 ObjectDestroy：目标是 Building 且 owner.country.id 等于
 * 本触发器 houseId 时 count++，再比较阈值。要求 player 已解析。
 *
 * 由 game/trigger/condition/DestroyedBuildingsCondition.ts.js 重写
 * 为 TS（行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { EventType } from "game/event/EventType"; // 已转换
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
export class DestroyedBuildingsCondition extends TriggerCondition {
  /** 已累计摧毁的本方建筑数。 */
  count: number;
  /** 触发阈值（params[1]）。 */
  threshold: number;

  constructor(event: any, trigger: any) {
    super(event, trigger);
    this.count = 0;
    this.threshold = Number(event.params[1]);
  }

  /** 累计本 house 建筑摧毁数，达到 threshold 则 true（粘滞）。 */
  check(_world: any, events: any[]): boolean {
    if (!this.player) return false;
    if (this.count >= this.threshold) return true;
    for (const event of events)
      if (event.type === EventType.ObjectDestroy) {
        const target = event.target;
        if (target.isBuilding() && target.owner.country?.id === (this as any).houseId) this.count++;
      }
    return this.count >= this.threshold;
  }
}
