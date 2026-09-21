/**
 * TaskRunner — 任务列表驱动器：每逻辑 tick 遍历并推进 tasks。
 *
 * 由 game/gameobject/task/system/TaskRunner.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包
 * 时优先采用 .ts 模块的编译产物。
 *
 * 状态机：
 *  - startTask：NotStarted → Running，再 onStart
 *  - tickTask：先 tick 子任务；存在未完成 blocking 子任务则直接 false
 *  - tickChildren：从列表中启动/推进任务，完成即 splice 移除
 */
import { TaskStatus } from "game/gameobject/task/system/TaskStatus";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class TaskRunner {
  tick(tasks: any[], world: any): void {
    this.tickChildren(tasks, world);
  }

  startTask(task: any, world: any): void {
    if (task.status !== TaskStatus.NotStarted)
      throw new Error("Attempted to start a task with status " + task.status);
    task.status = TaskStatus.Running;
    task.onStart(world);
  }

  tickTask(task: any, world: any): boolean {
    let childrenDone = this.tickChildren(task.children, world);
    const blockingChild = task.children.find((c: any) => c.blocking);
    if (!childrenDone && blockingChild) return false;
    if (!world.isSpawned) return false;
    if (task.status === TaskStatus.NotStarted) throw new Error("Attempted tick on a non-started task");
    if (task.isRunning() || task.isCancelling()) {
      const wasCancelling = task.isCancelling();
      let proceed = !!task.waitingForChildrenToFinish || task.onTick(world);
      if (task.children.length && !blockingChild && proceed) {
        childrenDone = task.children.every(
          (c: any) => c.status === TaskStatus.Cancelled || c.status === TaskStatus.Finished,
        );
        task.waitingForChildrenToFinish = !childrenDone;
      }
      proceed = proceed && childrenDone;
      if (proceed) {
        task.onEnd(world);
        task.status = wasCancelling ? TaskStatus.Cancelled : TaskStatus.Finished;
      }
      return proceed;
    }
    return true;
  }

  tickChildren(tasks: any[], world: any): boolean {
    let allDone = true;
    if (tasks.length) {
      const visited = new Set();
      let current;
      while (world.isSpawned && (current = tasks.find((t: any) => !visited.has(t)))) {
        let done;
        if (current.status === TaskStatus.NotStarted) this.startTask(current, world);
        if (current.status === TaskStatus.Running || current.status === TaskStatus.Cancelling) {
          done = true === this.tickTask(current, world);
        } else {
          if (current.status !== TaskStatus.Cancelled)
            throw new Error("Unhandled task status " + TaskStatus[current.status]);
          done = true;
        }
        if (done) {
          const idx = tasks.indexOf(current);
          if (idx !== -1) tasks.splice(idx, 1);
        } else {
          allDone = false;
          if (current.blocking) break;
          visited.add(current);
        }
      }
    }
    return allDone;
  }
}
