/**
 * CommandBarButtonType — HUD 命令栏按钮类型（数字枚举）。
 *
 * 由 gui/screen/game/component/hud/commandBar/CommandBarButtonType.ts.js
 * 重写为 TS。枚举值 0..15 与孪生一致。
 *
 * 由 gui/screen/game/component/hud/commandBar/CommandBarButtonType.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/** 命令栏按钮类型。 */
export enum CommandBarButtonType {
  /** 分隔符 */
  Separator = 0,
  /** Bug 报告 */
  BugReport = 1,
  /** 信标 */
  Beacon = 2,
  /** 欢呼 */
  Cheer = 3,
  /** 展开 */
  Deploy = 4,
  /** 警戒 */
  Guard = 5,
  /** 规划模式 */
  PlanningMode = 6,
  /** 停止 */
  Stop = 7,
  /** 部队 1 */
  Team01 = 8,
  /** 部队 2 */
  Team02 = 9,
  /** 部队 3 */
  Team03 = 10,
  /** 类型选择 */
  TypeSelect = 11,
  /** 回放快退 */
  ReplayRewind = 12,
  /** 回放播放 */
  ReplayPlay = 13,
  /** 回放暂停 */
  ReplayPause = 14,
  /** 回放速度 */
  ReplaySpeed = 15,
}
