/**
 * ZoneType — 单位所在区域分类 + 按地表类型推导区域的工具函数。
 *
 * 寻路与武器判定用：地面单位走 Ground 区、飞行器在 Air 区、船只在
 * Water 区；getZoneType 把地表类型（LandType）粗分为水/陆两域。
 *
 * 由 game/gameobject/unit/ZoneType.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import * as LandTypeModule from "game/type/LandType";

/** 按地表类型推导区域：水面/滩涂归水区，其余归陆区。 */
export function getZoneType(landType: any): any {
  return [LandTypeModule.LandType.Water, LandTypeModule.LandType.Beach].includes(landType)
    ? ZoneType.Water
    : ZoneType.Ground;
}

/** 区域分类。 */
export enum ZoneType {
  /** 陆地。 */
  Ground = 0,
  /** 空中。 */
  Air = 1,
  /** 水面/水下。 */
  Water = 2,
}
