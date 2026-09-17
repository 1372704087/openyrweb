/**
 * LandType — 地表类型（决定通行速度/可建造/弹头 verses 查表维度）。
 *
 * 由 game/type/LandType.ts.js 重写为 TS（行为完全一致，枚举值脚本提取自原文件）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { TerrainType } from "engine/type/TerrainType";

export enum LandType {
  /** 平地 */
  Clear = 0,
  /** 道路 */
  Road = 1,
  /** 岩石 */
  Rock = 2,
  /** 滩涂 */
  Beach = 3,
  /** 崎岖 */
  Rough = 4,
  /** 铁路 */
  Railroad = 5,
  /** 杂草 */
  Weeds = 6,
  /** 水面 */
  Water = 7,
  /** 墙 */
  Wall = 8,
  /** 矿石 */
  Tiberium = 9,
  /** 悬崖 */
  Cliff = 10,
}

/** TerrainType → LandType 映射（与基线一致，在枚举定义后初始化）。 */
const terrainToLand = new Map<number, LandType>([
  [TerrainType.Default, LandType.Clear],
  [TerrainType.Clear, LandType.Clear],
  [TerrainType.Tunnel, LandType.Cliff],
  [TerrainType.Railroad, LandType.Railroad],
  [TerrainType.Rock1, LandType.Rock],
  [TerrainType.Rock2, LandType.Rock],
  [TerrainType.Water, LandType.Water],
  [TerrainType.Shore, LandType.Beach],
  [TerrainType.Pavement, LandType.Road],
  [TerrainType.Dirt, LandType.Road],
  [TerrainType.Rough, LandType.Rough],
  [TerrainType.Cliff, LandType.Cliff],
]);

/** 按地形类型查地表类型；未知类型抛错（与基线一致）。 */
export function getLandType(terrainType: number): LandType {
  const land = terrainToLand.get(terrainType);
  if (land === undefined) throw new Error("Unknown terrain type " + terrainType);
  return land;
}
