/**
 * SuperWeaponType — 超级武器类型枚举（SuperWeapon= 键的合法值）。
 *
 * GeneticConverter = 9 是 GeneticMutator = 9 的原版 INI 别名（引擎内部
 * 名 GeneticMutator，YR 的 INI 拼写 GeneticConverter）。它以枚举外普通
 * 赋值注册（不走反向映射），确保 SuperWeaponType[9] === "GeneticMutator"
 * 与孪生行为一致——若写成正式枚举成员，tsc 会给它也生成反向映射，
 * 导致 [9] 被覆盖为 "GeneticConverter"。
 *
 * 由 game/type/SuperWeaponType.ts.js 重写为 TS（行为完全一致，枚举值
 * 脚本提取自原文件）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export enum SuperWeaponType {
  /** 原版 YR 超武类型 0。 */
  MultiMissile = 0,
  /** 原版 YR 超武类型 1。 */
  IronCurtain = 1,
  /** 原版 YR 超武类型 2。 */
  LightningStorm = 2,
  /** 原版 YR 超武类型 3。 */
  ChronoSphere = 3,
  /** 原版 YR 超武类型 4。 */
  ChronoWarp = 4,
  /** 原版 YR 超武类型 5。 */
  ParaDrop = 5,
  /** 原版 YR 超武类型 6。 */
  AmerParaDrop = 6,
  /** 原版 YR 超武类型 7。 */
  PsychicDominator = 7,
  /** 原版 YR 超武类型 8。 */
  SpyPlane = 8,
  /** 引擎内部名（效果类 GeneticMutatorEffect）。 */
  GeneticMutator = 9,
  /** 原版 YR 超武类型 10。 */
  ForceShield = 10,
  /** 原版 YR 超武类型 11。 */
  PsychicReveal = 11,
}

// GeneticConverter 是 GeneticMutator 的原版 INI 别名（同值 9），
// 以普通前向赋值注册——不产生反向映射，[9] 保持 "GeneticMutator"。
(SuperWeaponType as any).GeneticConverter = 9;
