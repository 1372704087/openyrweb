/**
 * Task — 全部任务（AI 指令序列）的基类。
 *
 * 任务系统的核心：玩家下达指令 → 创建 Task 排入 unitOrderTrait →
 * 每逻辑 tick 调 onTick 驱动 → 返回 true 表示完成。任务可取消、可
 * 挂子任务（children 联动取消）、可标记是否阻塞后续任务。
 *
 * 由 game/gameobject/task/system/Task.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import { TaskStatus } from "game/gameobject/task/system/TaskStatus";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class Task {
  status: TaskStatus = TaskStatus.NotStarted;
  children: any[] = [];
  cancellable = true;
  useChildTargetLines = false;
  blocking = true;
  waitingForChildrenToFinish = false;
  preventOpportunityFire = true;
  preventLanding = true;
  isAttackMove = false;

  isRunning(): boolean {
    return this.status === TaskStatus.Running;
  }

  isCancelling(): boolean {
    return this.status === TaskStatus.Cancelling;
  }

  setCancellable(cancellable: boolean): this {
    this.cancellable = cancellable;
    return this;
  }

  setBlocking(blocking: boolean): this {
    this.blocking = blocking;
    return this;
  }

  onStart(world: any): void {}

  onEnd(world: any): void {}

  cancel(): void {
    if (this.cancellable) {
      if (this.status === TaskStatus.Running) {
        this.status = TaskStatus.Cancelling;
        if (this.children.length) this.children.forEach((child) => child.cancel());
      } else if (this.status === TaskStatus.NotStarted) {
        this.status = TaskStatus.Cancelled;
        if (this.children.length)
          throw new Error("Should't have any children before starting a task");
      }
    }
  }

  getTargetLinesConfig(world: any): void {}
}
