/**
 * VeteranAbility — 老兵级晋升可授予的能力位（规则 VeteranAbilities/EliteAbilities 的解析值）。
 *
 * 由 game/gameobject/unit/VeteranAbility.ts.js 重写为 TS（行为完全一致，枚举值脚本提取自原文件）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export enum VeteranAbility {
  /** 加速 */
  FASTER = 0,
  /** 增甲 */
  STRONGER = 1,
  /** 火力提升 */
  FIREPOWER = 2,
  /** 减少受击散布 */
  SCATTER = 3,
  /** 射速提升 */
  ROF = 4,
  /** 视野提升 */
  SIGHT = 5,
  /** 自动回血 */
  SELF_HEAL = 6,
  /** 隐形 */
  CLOAK = 7,
  /** 阵亡自爆 */
  EXPLODES = 8,
  /** 雷达隐形 */
  RADAR_INVISIBLE = 9,
  /** 侦测隐形 */
  SENSORS = 10,
  /** 无畏（不受士气影响） */
  FEARLESS = 11,
  /** 携行 C4（步兵可炸建筑） */
  C4 = 12,
  /** 区域警戒 */
  GUARD_AREA = 13,
  /** 可碾压 */
  CRUSHER = 14,
}
