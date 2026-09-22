/**
 * TriggerAction — 触发器动作数据的结构类型（仅类型，无运行时导出）。
 *
 * 由 data/map/trigger/TriggerAction.ts.js 重写为 TS：孪生 execute 为空
 * （SystemJS 编译后无任何运行时导出），本文件只导出 interface，避免产生
 * 意外运行时对象破坏 tests/ts-parity.mjs 的键集合比对。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 *
 * 用途：描述 INI 地图 [Actions] 节解析出的一条动作记录，以及执行器
 * （TriggerExecutor 孪生）所持有的 action 字段形状。
 */
export interface TriggerAction {
  /** 所属触发器 ID。 */
  triggerId: number | string;
  /** 本动作在触发器动作列表中的序号（0 起）。 */
  index: number;
  /** 动作类型数字 ID（见 TriggerActionType）。 */
  type: number;
  /** 动作参数串数组；params[0] 常为类型，params[1..] 为业务参数。 */
  params: any[];
}
