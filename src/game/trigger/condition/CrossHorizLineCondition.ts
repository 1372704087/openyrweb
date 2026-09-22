/**
 * CrossHorizLineCondition — 穿越水平线条件。
 *
 * 由 game/trigger/condition/CrossHorizLineCondition.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 对应 TriggerEventType.CrossesHorizontalLine=25：过滤 EnterTile 事件，
 * 源单位非空军、与标签目标共享同一 ry（行）、且（houseId=-1 或源单位
 * 所有者国家 id 匹配）；返回进入的目标格子列表。
 */
import { EventType } from "game/event/EventType"; // 孪生
import { ZoneType } from "game/gameobject/unit/ZoneType"; // 未转换（any-shim）
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
export class CrossHorizLineCondition extends TriggerCondition {
  /** 行进单位所属国家 id；-1 表示任意。 */
  houseId: number;

  constructor(event: any, trigger: any) {
    super(event, trigger);
    this.houseId = Number(this.event.params[1]);
  }

  /**
   * 检查本批事件中是否有穿越水平线。
   *
   * @returns 命中的目标格子数组。
   */
  check(_context?: any, events?: any[]): any[] {
    return events
      .filter(
        (ev) =>
          ev.type === EventType.EnterTile &&
          ev.source.zone !== (ZoneType as any).Air &&
          this.targets.some((t) => t.ry === ev.target.ry) &&
          (-1 === this.houseId || ev.source.owner.country?.id === this.houseId),
      )
      .map((ev) => ev.target);
  }
}
