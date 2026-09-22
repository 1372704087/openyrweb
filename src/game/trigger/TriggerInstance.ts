/**
 * TriggerInstance — 运行时触发器实例（type-only）。
 *
 * 原始孪生为空模块；此处按 TriggerManager.createTriggerInstance / update
 * 实际读写的字段补全接口。运行时无导出，仅作 TS 类型引用。
 *
 * 由 game/trigger/TriggerInstance.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import type { Trigger } from "data/map/trigger/Trigger"; // 本组已写
import type { TriggerCondition } from "game/trigger/TriggerCondition"; // 孪生

export interface TriggerInstance {
  /** 对应的地图触发器定义。 */
  trigger: Trigger;
  /** 已创建并按 blocking 降序排序的条件实例。 */
  conditions: TriggerCondition[];
  /** Tag 绑定的目标对象（同一数组引用亦传入各 condition.setTargets）。 */
  targets: any[];
  /** OnceAll 语义下尚未命中的目标；其他 repeat 类型为空数组。 */
  remainingTargets: Set<any>;
  /** 是否被 Enable/Disable Trigger 动作禁用。 */
  disabled: boolean;
  /** 非 Repeat 触发一次后置 true，之后不再检查。 */
  finished: boolean;
}
