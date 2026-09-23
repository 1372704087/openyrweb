/**
 * ScreenType — 根级屏幕类型枚举。
 *
 * MainMenuRoot=0 主菜单根；Game=1 对局；Replay=2 回放。
 * 数值与反向映射与孪生 TS 枚举完全一致。
 *
 * 由 gui/screen/ScreenType.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export enum ScreenType {
  /** 主菜单根屏幕。 */
  MainMenuRoot = 0,
  /** 对局（游戏）屏幕。 */
  Game = 1,
  /** 回放屏幕。 */
  Replay = 2,
}
