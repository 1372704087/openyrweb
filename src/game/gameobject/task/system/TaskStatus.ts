/** 任务状态。由 game/gameobject/task/system/TaskStatus.ts.js 重写为 TS。 */
export enum TaskStatus {
  NotStarted = 0,
  Running = 1,
  Finished = 2,
  Cancelling = 3,
  Cancelled = 4,
}
