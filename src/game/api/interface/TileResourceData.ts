/**
 * TileResourceData — tile 上矿石/宝石资源摘要（type-only）。
 *
 * 由 MapApi.getTileResourceData / getAllTilesResourceData 返回：
 * 叠加层矿（ore/gems 互斥计数）或会产矿的地形（spawnsOre=true）。
 *
 * 由 game/api/interface/TileResourceData.ts.js 重写为 TS。
 * 孪生 SystemJS 注册后 execute 为空（无运行时导出）；本文件仅以
 * export interface 声明类型，export {} 保持与孪生一致的零运行时导出。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
/** tile 资源数据（type-only，运行时无导出对象）。 */
export interface TileResourceData {
  /** 资源所在 tile。 */
  tile: any;
  /** 普通矿石量（Gems 类型时为 0）。 */
  ore: any;
  /** 宝石量（非 Gems 时为 0）。 */
  gems: any;
  /** 是否为会产矿的地形（叠加层矿为 false）。 */
  spawnsOre: any;
}

export {};
