/** 任务状态。由 game/gameobject/task/system/TaskStatus.ts.js 重写为 TS。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export enum TaskStatus {
  NotStarted = 0,
  Running = 1,
  Finished = 2,
  Cancelling = 3,
  Cancelled = 4,
}
