/**
 * TriggerEvent — 地图触发事件数据占位模块。
 *
 * 孪生 SystemJS 模块注册后无任何导出（execute 为空），仅作为
 * data/map/trigger 命名空间下的事件类型占位；本 TS 文件保持同样
 * 的"无导出"语义（export {} 使其成为合法模块）。
 *
 * 由 data/map/trigger/TriggerEvent.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
/** 触发器事件数据形状（type-only，运行时无导出对象）。 */
export interface TriggerEvent {
  triggerId: string | number;
  eventIndex: number;
  type: number;
  params: any[];
}

export {};
