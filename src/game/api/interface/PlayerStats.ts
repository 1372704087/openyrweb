/**
 * PlayerStats — 玩家统计聚合形状（type-only）。
 *
 * 由 game/api/interface/PlayerStats.ts.js 重写为 TS。
 * 孪生 SystemJS 注册后 execute 为空（无运行时导出），且当前消费方
 * 未引用具名字段；与孪生一致保持零运行时导出，仅保留 type-only 模块
 * 语义（export {}），不臆造运行时符号。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
/** 玩家统计（type-only 占位，运行时无导出对象）。 */
export interface PlayerStats {
  [key: string]: any;
}

export {};
