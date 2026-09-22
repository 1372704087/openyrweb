/**
 * UserInputExecutor — 锁定/解锁玩家单位操控（动作 46/47）。
 *
 * 第三参 lock（DisableUserInput→true / Enable→false）。execute 置
 * world.inputLocked 并 console.debug 记录状态；GUI 层每帧轮询该
 * 标志桥接 WorldInteraction.setEnabled。
 *
 * 由 game/trigger/executor/UserInputExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class UserInputExecutor extends TriggerExecutor {
  /** true=锁定输入 / false=解锁。 */
  lock: boolean;

  constructor(action: any, trigger: any, lock: boolean) {
    super(action, trigger);
    this.lock = lock;
  }

  /** 写入 world.inputLocked 并打印 debug 日志。 */
  execute(world: any): void {
    world.inputLocked = !!this.lock;
    console.debug(
      `[OpenYRWeb] Trigger action "${this.lock ? "DisableUserInput" : "EnableUserInput"}" (${this.getDebugName()}) — input ${this.lock ? "locked" : "unlocked"}.`,
    );
  }
}
