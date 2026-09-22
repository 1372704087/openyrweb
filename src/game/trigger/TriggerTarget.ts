/**
 * TriggerTarget — 触发器目标(tag 绑定的单位/建筑集合)的结构类型
 * （仅类型，无运行时导出）。
 *
 * 由 game/trigger/TriggerTarget.ts.js 重写为 TS：孪生 execute 为空
 * （SystemJS 编译后无任何运行时导出），本文件只导出 interface，避免产生
 * 意外运行时对象破坏 tests/ts-parity.mjs 的键集合比对。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 *
 * 用途：TriggerCondition.setTargets 与 TriggerInstance 将标签解析出的
 * 目标对象集合写入该形状；具体对象字段随世界对象类型变化，标为 any。
 */
export interface TriggerTarget {
  /** 目标对象本体（通常为 GameObject / Techno 孪生引用）。 */
  gameObject?: any;
  /** 目标所在行/列（条件里常用 ry/ry 过滤水平线穿越）。 */
  ry?: number;
  /** 目标所在列（部分条件与路径点逻辑用到）。 */
  rx?: number;
  [key: string]: any;
}
