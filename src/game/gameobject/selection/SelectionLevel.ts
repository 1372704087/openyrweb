/**
 * SelectionLevel — 选择框显示级别（位掩码枚举）。
 *
 * 用作位标志组合选择与悬停状态：None(0)/Hover(1)/Selected(2)/
 * SelectedHover(3)。SelectionModel.setSelectionLevel 以 Math.min 与
 * maxSelectionLevel 封顶；isHovered 测位、isSelected 测数值。
 *
 * 由 game/gameobject/selection/SelectionLevel.ts.js 重写为 TS（行为完全
 * 一致，枚举值脚本提取自原文件）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export enum SelectionLevel {
  /** 未选中、未悬停。 */
  None = 0,
  /** 悬停（未选中）。 */
  Hover = 1,
  /** 已选中（未悬停）。 */
  Selected = 2,
  /** 已选中且悬停。 */
  SelectedHover = 3,
}
