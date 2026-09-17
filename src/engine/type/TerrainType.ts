/**
 * TerrainType — 地形类型（地图 tile 的 terrainType= 字段）。
 *
 * 由 engine/type/TerrainType.ts.js 重写为 TS（行为完全一致，枚举值脚本提取自原文件）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export enum TerrainType {
  /** 缺省 */
  Default = 0,
  /** 隧道 */
  Tunnel = 5,
  /** 铁路 */
  Railroad = 6,
  /** 岩石 1 */
  Rock1 = 7,
  /** 岩石 2 */
  Rock2 = 8,
  /** 水面 */
  Water = 9,
  /** 滩岸 */
  Shore = 10,
  /** 铺面 */
  Pavement = 11,
  /** 泥土 */
  Dirt = 12,
  /** 平地 */
  Clear = 13,
  /** 崎岖 */
  Rough = 14,
  /** 悬崖 */
  Cliff = 15,
}
