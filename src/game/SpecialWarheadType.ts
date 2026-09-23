/**
 * SpecialWarheadType — 特殊弹头类型枚举。
 *
 * 用于标识 Warhead 中走特殊结算分支的弹头（碎片、闪电风暴标记、TNT 等），
 * 与 SuperWeaponType / WeaponType 一样以数值枚举形式参与 lockstep 哈希。
 *
 * 由 game/SpecialWarheadType.ts.js 重写为 TS（行为完全一致，枚举值
 * 脚本提取自原文件）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export enum SpecialWarheadType {
  /** 无特殊弹头（走常规伤害公式）。 */
  None = 0,
  /** 碎片弹头：爆炸后产生二次碎片。 */
  Shrapnel = 1,
  /** 闪电风暴标记弹头（LightningStrike）。 */
  LightningStrike = 2,
  /** TNT 炸药包弹头（PlantC4 / TntChargeTrait）。 */
  TntCharge = 3,
}
