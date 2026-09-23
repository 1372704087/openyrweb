/**
 * SelectMapParams — 选图路由参数（type-only 空执行模块）。
 *
 * 孪生 execute 为空，运行时不导出任何值；原 TS 应为
 * 如 { startIn?: string, onPick?: ... } 的接口。
 *
 * 由 gui/screen/mainMenu/lobby/SelectMapParams.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */

/** 选图参数。 */
export interface SelectMapParams {
  /** 起始目录/上下文。 */
  startIn?: any;
  /** 选中回调。 */
  onPick?: (map: any) => void;
}
