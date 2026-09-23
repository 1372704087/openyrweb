/**
 * ScreenType — 游戏内菜单子屏类型（数字枚举）。
 *
 * 由 gui/screen/game/gameMenu/ScreenType.ts.js 重写为 TS。
 * 枚举值 0..6 与孪生一致，字符串名为孪生反向还原。
 *
 * 由 gui/screen/game/gameMenu/ScreenType.ts.js 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/** 游戏内菜单子屏。 */
export enum ScreenType {
  /** 主页 */
  Home = 0,
  /** 外交 */
  Diplo = 1,
  /** 连接信息 */
  ConnectionInfo = 2,
  /** 退出确认 */
  QuitConfirm = 3,
  /** 选项 */
  Options = 4,
  /** 声音选项 */
  OptionsSound = 5,
  /** 键位选项 */
  OptionsKeyboard = 6,
}
