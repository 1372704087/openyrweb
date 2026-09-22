/**
 * MiscActionExecutor — 受限动作的"有日志的无操作"占位。
 *
 * 为依赖本构建暂缺子系统的动作（生产/音乐/影片/视图缩放等）提供
 * 统一 no-op：execute 仅 console.debug 打印 label 与调试名，不改变
 * 世界状态。label 由工厂在每个 case 传入。
 *
 * 由 game/trigger/executor/MiscActionExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class MiscActionExecutor extends TriggerExecutor {
  /** 动作标签（工厂传入，用于日志）。 */
  label: string;

  constructor(action: any, trigger: any, label: string) {
    super(action, trigger);
    this.label = label;
  }

  /** 打印不支持提示（debug 级，不刷屏）。 */
  execute(_world?: any): void {
    console.debug(
      `[OpenYRWeb] Trigger action "${this.label}" (${this.getDebugName()}) is not supported by this build — no-op.`,
    );
  }
}
