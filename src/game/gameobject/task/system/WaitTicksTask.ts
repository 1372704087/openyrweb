/**
 * WaitTicksTask — 等待指定 tick 数的任务。
 *
 * 由 game/gameobject/task/system/WaitTicksTask.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标。
 */
import { Task } from "game/gameobject/task/system/Task";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class WaitTicksTask extends Task {
  ticks: number;

  constructor(ticks: number) {
    super();
    this.ticks = ticks;
  }

  onTick(world: any): boolean {
    return !!this.isCancelling() || !(this.ticks-- > 0);
  }
}
