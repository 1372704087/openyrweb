/**
 * LightingType — 照明计算等级（决定 tint / level / ambient 的组合方式）。
 *
 * 由 engine/type/LightingType.ts.js 重写为 TS（行为完全一致，枚举值脚本提取自原文件）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export enum LightingType {
  /** 无照明（返回纯白 (1,1,1)） */
  None = 0,
  /** 全局照明（Global） */
  Global = 1,
  /** 层高照明（Level） */
  Level = 2,
  /** 环境光（Ambient） */
  Ambient = 3,
  /** 完整着色（Full，应用调色板 tint 与 tile light） */
  Full = 4,
  /** 默认照明（Default） */
  Default = 5,
}
