/**
 * BuildingPlacementData — 建筑放置预览所需的数据形状（type-only）。
 *
 * 由 GameApi.getBuildingPlacementData(name) 返回：foundation（占地格）
 * 与 foundationCenter（中心偏移），供 GUI/放置预览计算落点。
 *
 * 由 game/api/interface/BuildingPlacementData.ts.js 重写为 TS。
 * 孪生 SystemJS 注册后 execute 为空（无运行时导出）；本文件仅以
 * export interface 声明类型，export {} 保持与孪生一致的零运行时导出。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
/** 建筑放置预览数据（type-only，运行时无导出对象）。 */
export interface BuildingPlacementData {
  /** 占地矩形格子列表。 */
  foundation: any[];
  /** 相对 origin 的中心偏移。 */
  foundationCenter: any;
}

export {};
