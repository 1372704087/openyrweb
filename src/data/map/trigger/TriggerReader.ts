/**
 * TriggerReader — 地图触发器段解析器。
 *
 * 解析状态机（read 组装阶段）：
 *  1. readTriggers([Triggers]) → Trigger[]（house/attached/name/disabled/difficulties）
 *  2. readEvents([Triggers] 关联事件段) → Map<triggerId, TriggerEvent[]> + unknown/unimplemented
 *  3. readActions([Actions]) → Map<triggerId, TriggerAction[]> + unknown/unimplemented
 *  4. 组装：
 *     - 把 events/actions push 进对应 Trigger
 *     - 解析 attachedTrigger 链，非根从 roots 集合剔除
 *  5. 对每个根：若有 cell/trigger tag 绑定 → 沿 attached 链回填共享同一 tag；
 *     否则整条链 warn 并从列表 splice 移除
 *  6. 返回 { triggers, unknownEventTypes, unknownActionTypes,
 *           unimplementedEventTypes, unimplementedActionTypes }
 *
 * 参数编码：
 *  - 事件行：count, 然后 count×(type, paramCount, params…)
 *  - 动作行：count, 然后 count×(type, 7 个字段)；第 7 字段若非空经 AZ 编码转数字
 *
 * 由 data/map/trigger/TriggerReader.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { TriggerEventType } from "data/map/trigger/TriggerEventType"; // 孪生
import { TriggerActionType } from "data/map/trigger/TriggerActionType"; // 孪生
import { TriggerSupport } from "data/map/trigger/TriggerSupport"; // 本组已写
import type { Trigger } from "data/map/trigger/Trigger"; // 本组已写

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TriggerReader {
  /**
   * 主入口：解析三个段 + cellTags，组装触发器并回填 tag。
   * @param triggerSection [Triggers] 段
   * @param eventSection 触发器事件段（结构同 INI 段）
   * @param actionSection [Actions] 段
   * @param cellTags 已解析的 CellTag 列表
   */
  read(triggerSection: any, eventSection: any, actionSection: any, cellTags: Iterable<any>) {
    const triggers = this.readTriggers(triggerSection);
    const { events, unknownEventTypes, unimplementedEventTypes } = this.readEvents(eventSection);
    const { actions, unknownActionTypes, unimplementedActionTypes } = this.readActions(actionSection);
    const allCells = [...cellTags];
    const roots = new Set<Trigger>(triggers);

    // 回填 events / actions / attachedTrigger，并把非根从 roots 剔除
    for (const t of triggers) {
      const evs = events.get(t.id);
      if (evs) t.events.push(...evs);
      const acts = actions.get(t.id);
      if (acts) t.actions.push(...acts);
      if (t.attachedTriggerId) {
        const parent = triggers.find((x) => x.id === t.attachedTriggerId);
        if (parent) {
          t.attachedTrigger = parent;
          roots.delete(parent);
        }
      }
    }

    // 根触发器：有绑定 → 沿链共享 tag；无绑定 → 整链移除
    for (const root of roots) {
      const cell = allCells.find((c) => c.triggerId === root.id);
      if (cell) {
        let cur: Trigger | undefined = root;
        while (cur) {
          cur.tag = cell as any;
          cur = cur.attachedTrigger;
        }
      } else {
        let cur: Trigger | undefined = root;
        while (cur) {
          console.warn(`Trigger ${cur.id} has no associated tag or valid root trigger. Skipping.`);
          const idx = triggers.indexOf(cur);
          if (idx !== -1) triggers.splice(idx, 1);
          cur = cur.attachedTrigger;
        }
      }
    }

    return {
      triggers,
      unknownEventTypes,
      unknownActionTypes,
      unimplementedEventTypes,
      unimplementedActionTypes,
    };
  }

  /** 解析 [Triggers] 段行：house,attached,name,disabled,easy,medium,hard[,…] */
  readTriggers(section: any): Trigger[] {
    const list: Trigger[] = [];
    for (const [id, line] of section.entries) {
      const parts = line.split(",");
      if (parts.length < 8) {
        console.warn(`Invalid trigger ${id}=${line}. Skipping.`);
        continue;
      }
      const t: Trigger = {
        id,
        houseName: parts[0],
        attachedTriggerId: parts[1] !== "<none>" ? parts[1] : undefined,
        attachedTrigger: undefined,
        name: parts[2],
        disabled: Boolean(Number(parts[3])),
        difficulties: {
          easy: Boolean(Number(parts[4])),
          medium: Boolean(Number(parts[5])),
          hard: Boolean(Number(parts[6])),
        },
        events: [],
        actions: [],
        tag: undefined,
      };
      list.push(t);
    }
    return list;
  }

  /** 解析事件段：每行 count + count×(type, paramCount, params…) */
  readEvents(section: any) {
    const events = new Map<string, any[]>();
    const unknownEventTypes = new Set<number>();
    const unimplementedEventTypes = new Set<number>();
    for (const [triggerId, line] of section.entries) {
      const parts = line.split(",");
      if (parts.length < 4) {
        console.warn(`Invalid event ${triggerId}=${line}. Skipping.`);
        continue;
      }
      const count = Number(parts.shift());
      const list: any[] = [];
      for (let i = 0; i < count; i++) {
        const type = Number(parts.shift());
        const paramCount = Number(parts.shift());
        // type=2 时读 2 个参数，否则 1 个
        const raw = parts.splice(0, paramCount === 2 ? 2 : 1);
        if (TriggerEventType[type] === undefined) {
          unknownEventTypes.add(type);
          console.warn(`Unknown event type ${type} for trigger id ${triggerId}. Skipping.`);
          continue;
        }
        if (TriggerSupport.placeholderEventTypes.has(type)) {
          unimplementedEventTypes.add(type);
        }
        list.push({
          triggerId,
          eventIndex: i,
          type,
          params: [paramCount, ...raw.map((x) => x || "0")],
        });
      }
      events.set(triggerId, list);
    }
    return { events, unknownEventTypes, unimplementedEventTypes };
  }

  /** 解析 [Actions] 段：count + count×(type + 7 字段) */
  readActions(section: any) {
    const actions = new Map<string, any[]>();
    const unknownActionTypes = new Set<number>();
    const unimplementedActionTypes = new Set<number>();
    for (const [triggerId, line] of section.entries) {
      const parts = line.split(",");
      if (parts.length < 9) {
        console.warn(`Invalid action ${triggerId}=${line}. Skipping.`);
        continue;
      }
      const count = Number(parts.shift());
      if (parts.length < 8 * count) {
        console.warn(`Invalid action ${triggerId}=${line}. Skipping.`);
        continue;
      }
      const list: any[] = [];
      for (let i = 0; i < count; i++) {
        const type = Number(parts.shift());
        const fields = parts.splice(0, 7);
        if (TriggerActionType[type] === undefined) {
          unknownActionTypes.add(type);
          console.warn(`Unknown action type ${type} for trigger id "${triggerId}". Skipping.`);
          continue;
        }
        if (TriggerSupport.placeholderActionTypes.has(type)) {
          unimplementedActionTypes.add(type);
        }
        list.push({
          triggerId,
          index: i,
          type,
          params: [
            Number(fields[0] || "0"),
            fields[1] || "0",
            fields[2] || "0",
            fields[3] || "0",
            fields[4] || "0",
            fields[5] || "0",
            fields[6] ? this.readAZActionParam(fields[6]) : 0,
          ],
        });
      }
      actions.set(triggerId, list);
    }
    return { actions, unknownActionTypes, unimplementedActionTypes };
  }

  /**
   * AZ 编码 → 整数：单字符 = char-('A')；双字符 = 高位(base26)×低位。
   * 例：'A'=0, 'B'=1, … 'AA'=0×26+0 … （与引擎一致）。
   */
  readAZActionParam(s: string): number {
    const z = "Z".charCodeAt(0);
    const a = "A".charCodeAt(0);
    const alphabet = z - a + 1;
    if (s.length > 1) {
      return s.charCodeAt(1) - a + (s.charCodeAt(0) - a + 1) * alphabet;
    }
    return s.charCodeAt(0) - a;
  }
}
