/**
 * PlaceCheckOptions — 建筑放置校验可选项（type-only）。
 *
 * GameApi.canPlaceBuilding 的第 4 参；未传时会就地补 {}，并按
 * ignoreAdjacent 缺省规则（建筑工地规则 → constructionYard）写回。
 * 最终与 { normalizedTile: true } 合并后交给 canPlaceAt。
 *
 * 由 game/api/interface/PlaceCheckOptions.ts.js 重写为 TS。
 * 孪生 SystemJS 注册后 execute 为空（无运行时导出）；本文件仅以
 * export interface 声明类型，export {} 保持与孪生一致的零运行时导出。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
/** 放置校验选项（type-only，运行时无导出对象）。 */
export interface PlaceCheckOptions {
  /** true 表示坐标已是归一化后的 tile（API 层固定传入）。 */
  normalizedTile?: any;
  /** 是否忽略相邻建筑约束（缺省由工地规则决定）。 */
  ignoreAdjacent?: any;
  /** 其余 canPlaceAt 透传字段。 */
  [key: string]: any;
}

export {};
