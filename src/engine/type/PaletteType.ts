/**
 * PaletteType — 调色板类别（Theater.getPalette 的选择键）。
 *
 * 由 engine/type/PaletteType.ts.js 重写为 TS（行为完全一致，枚举值脚本提取自原文件）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export enum PaletteType {
  /** 未指定（实际走 default 分支，返回 iso 调色板） */
  None = 0,
  /** 地块 / 等距场景调色板 */
  Iso = 1,
  /** 单位调色板 */
  Unit = 2,
  /** 覆盖物（Overlay）调色板 */
  Overlay = 3,
  /** 动画（Anim）调色板 */
  Anim = 4,
  /** 自定义调色板（按名称从 palettes 查找） */
  Custom = 5,
  /** 默认调色板（与 None 一样落到 default） */
  Default = 6,
}
