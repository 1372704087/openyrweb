/**
 * WeaponType — 单位武器槽位（rules 中 Primary/Secondary/DeathWeapon 三把武器的键）。
 *
 * 由 game/WeaponType.ts.js 重写为 TS（行为完全一致，枚举值脚本提取自原文件）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export enum WeaponType {
  /** 主武器 */
  Primary = 0,
  /** 副武器 */
  Secondary = 1,
  /** 死亡武器（阵亡时引爆，如自爆卡车） */
  DeathWeapon = 2,
}
