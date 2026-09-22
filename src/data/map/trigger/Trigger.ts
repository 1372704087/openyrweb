/**
 * Trigger — 地图 [Triggers] 段解析出的触发器数据结构（type-only）。
 *
 * 原始孪生为空模块；此处按 TriggerReader.readTriggers 实际填充的字段
 * 补全接口。运行时无导出，仅作 TS 类型引用。
 *
 * 由 data/map/trigger/Trigger.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import type { Tag } from "data/map/tag/Tag"; // 孪生
import type { TriggerEvent } from "data/map/trigger/TriggerEvent"; // 孪生
import type { TriggerAction } from "data/map/trigger/TriggerAction"; // 孪生

export interface Trigger {
  /** 触发器 id（[Triggers] 行键）。 */
  id: string;
  /** 所属阵营 HouseName（[Triggers] 字段 0）。 */
  houseName: string;
  /** 挂接的父触发器 id；"<none>" 读为 undefined。 */
  attachedTriggerId?: string;
  /** 已解析的父触发器引用（read 组装阶段回填）。 */
  attachedTrigger?: Trigger;
  /** 触发器显示名。 */
  name: string;
  /** 是否被禁用。 */
  disabled: boolean;
  /** 三个难度是否启用。 */
  difficulties: { easy: boolean; medium: boolean; hard: boolean };
  /** 条件（事件）列表，readEvents 按 triggerId 回填。 */
  events: TriggerEvent[];
  /** 动作列表，readActions 按 triggerId 回填。 */
  actions: TriggerAction[];
  /** 关联 Tag（根触发器按 cell/trigger 关联；非根经 attachedTrigger 链共享）。 */
  tag?: Tag;
}
