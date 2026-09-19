/**
 * WaitForBuildUpTask — 等待建筑建造完成（建造条走完）的任务组。
 *
 * 组合两个子任务并行驱动：
 *  - WaitMinutesTask：按建筑 rules 的建造时长（分钟）挂起；
 *  - CallbackTask：时长走完时把建筑 buildStatus 切到 Ready
 *    （内部会广播 NotifyBuildStatus 并派发 BuildStatusChangeEvent）。
 *
 * cancellable = false：建造期间不能"取消任务"取消本组（卖建筑走
 * 专门的 Sell 流程，与本任务无关）。
 *
 * 由 game/gameobject/task/WaitForBuildUpTask.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标。
 */
import { BuildStatus } from "game/gameobject/Building"; // 已转换
import { CallbackTask } from "game/gameobject/task/system/CallbackTask"; // 已转换
import { TaskGroup } from "game/gameobject/task/system/TaskGroup"; // 已转换
import { WaitMinutesTask } from "game/gameobject/task/system/WaitMinutesTask"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class WaitForBuildUpTask extends TaskGroup {
  constructor(minutes: number, building: any) {
    super(
      new WaitMinutesTask(minutes),
      new CallbackTask((world: any) => world.setBuildStatus(BuildStatus.Ready, building)),
    );
    this.cancellable = false;
  }
}
