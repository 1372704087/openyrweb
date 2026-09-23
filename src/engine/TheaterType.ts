/**
 * TheaterType — 战区（Theater）类型位掩码。
 *
 * 由 engine/TheaterType.ts.js 重写为 TS（行为完全一致，枚举值脚本提取自原文件）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export enum TheaterType {
  /** 无战区 */
  None = 0,
  /** 温带（Temperate） */
  Temperate = 1,
  /** 都市（Urban） */
  Urban = 2,
  /** 雪地（Snow） */
  Snow = 4,
  /** 月面（Lunar） */
  Lunar = 8,
  /** 沙漠（Desert） */
  Desert = 16,
  /** 新都市（NewUrban） */
  NewUrban = 32,
  /** 全部战区位或运算结果 */
  All = 63,
}
