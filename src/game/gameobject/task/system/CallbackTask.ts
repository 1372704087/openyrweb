/**
 * CallbackTask — 回调任务：onTick 执行一次回调后立即完成。
 *
 * 由 game/gameobject/task/system/CallbackTask.ts.js 重写为 TS（行为
 * 完全一致）。两个文件并存期间，本文件才是修改目标。
 */
import { Task } from "game/gameobject/task/system/Task";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class CallbackTask extends Task {
  cb: (world: any) => void;

  constructor(cb: (world: any) => void) {
    super();
    this.cb = cb;
  }

  onTick(world: any): boolean {
    this.cb(world);
    return true;
  }
}
