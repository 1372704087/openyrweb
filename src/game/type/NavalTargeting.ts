/**
 * NavalTargeting — 对水上/水下目标的开火策略。
 *
 * 由 game/type/NavalTargeting.ts.js 重写为 TS（行为完全一致，枚举值脚本提取自原文件）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export enum NavalTargeting {
  /** 不可打水下 */
  UnderwaterNever = 0,
  /** 副武器打水下 */
  UnderwaterSecondary = 1,
  /** 只能打水下 */
  UnderwaterOnly = 2,
  /** 副武器打生物 */
  OrganicSecondary = 3,
  /** 海豹特例 */
  SealSpecial = 4,
  /** 全可打 */
  NavalAll = 5,
  /** 全不可打 */
  NavalNone = 6,
  /** 原版 YR 新增值。据 ModEnc，5 与 7 等效（引擎对未识别值按 NAVAL_ALL 处理）；原版 rulesmd.ini 有个别处写了 7，登记此值以消除警告而不改行为 */
  NavalAllEquivalent = 7,
}
