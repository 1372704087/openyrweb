/**
 * ModStatus — 模组安装状态枚举。
 *
 * NotInstalled=0 / Installed=1 / UpdateAvailable=2。
 *
 * 由 gui/screen/mainMenu/modSel/ModStatus.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标。
 */
export enum ModStatus {
  /** 未安装。 */
  NotInstalled = 0,
  /** 已安装。 */
  Installed = 1,
  /** 有可用更新。 */
  UpdateAvailable = 2,
}
