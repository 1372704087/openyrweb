/**
 * TaskGroup — 任务组合：构造时批量注入子任务。
 *
 * 由 game/gameobject/task/system/TaskGroup.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标。
 */
import { Task } from "game/gameobject/task/system/Task";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TaskGroup extends Task {
  constructor(...tasks: any[]) {
    super();
    this.children.push(...tasks);
  }

  onTick(world: any): boolean {
    return true;
  }
}
