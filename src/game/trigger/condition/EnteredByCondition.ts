/**
 * EnteredByCondition — 被指定方进入条件。
 *
 * 由 game/trigger/condition/EnteredByCondition.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 对应 TriggerEventType.EnteredBy=1：过滤 EnterObject / EnterTile；
 * 目标须在标签 targets 内；EnterTile 时排除空军；houseId=-1 或源单位
 * 所有者国家 id 匹配；返回进入的目标对象列表。
 */
import { EventType } from "game/event/EventType"; // 孪生
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 未转换（any-shim）
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
export class EnteredByCondition extends TriggerCondition {
  /** 进入方国家 id；-1 表示任意。 */
  houseId: number;

  constructor(event: any, trigger: any) {
    super(event, trigger);
    this.houseId = Number(this.event.params[1]);
  }

  /**
   * 检查本批事件中是否有匹配的进入。
   *
   * @returns 命中的目标对象数组。
   */
  check(_context?: any, events?: any[]): any[] {
    return events
      .filter(
        (ev) =>
          (ev.type === EventType.EnterObject || ev.type === EventType.EnterTile) &&
          this.targets.includes(ev.target) &&
          (ev.type !== EventType.EnterTile || ev.source.zone !== (ZoneType as any).Air) &&
          (-1 === this.houseId || ev.source.owner.country?.id === this.houseId),
      )
      .map((ev) => ev.target);
  }
}
