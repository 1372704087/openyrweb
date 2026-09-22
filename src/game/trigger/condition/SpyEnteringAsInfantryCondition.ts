/**
 * SpyEnteringAsInfantryCondition — 间谍以步兵身份进入条件。
 *
 * 由 game/trigger/condition/SpyEnteringAsInfantryCondition.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 对应 TriggerEventType.SpyEnteringAsInfantry=54：infantryIdx 取
 * params[1]；过滤 BuildingInfiltration，目标在 targets 内，且渗透者
 * 当前伪装规则 index 等于 infantryIdx；返回被渗透建筑列表。
 */
import { EventType } from "game/event/EventType"; // 孪生
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
export class SpyEnteringAsInfantryCondition extends TriggerCondition {
  /** 期望的间谍伪装步兵规则索引（params[1]）。 */
  infantryIdx: number;

  constructor(event: any, trigger: any) {
    super(event, trigger);
    this.infantryIdx = Number(event.params[1]);
  }

  /**
   * 检查本批事件中是否有匹配的间谍进入。
   *
   * @returns 命中的目标（被渗透建筑）数组。
   */
  check(_context?: any, events?: any[]): any[] {
    return events
      .filter((ev) => {
        if (ev.type !== EventType.BuildingInfiltration) return !1;
        const target = ev.target;
        return (
          !!this.targets.includes(target) &&
          ev.source.disguiseTrait?.getDisguise()?.rules.index === this.infantryIdx
        );
      })
      .map((ev) => ev.target);
  }
}
