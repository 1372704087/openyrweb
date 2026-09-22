/**
 * NoActionExecutor — 空动作占位（NoAction / 未实现动作的默认占位）。
 *
 * execute 为空实现，什么都不做；用于工厂 default 分支中
 * placeholderActionTypes 命中时避免抛错。
 *
 * 由 game/trigger/executor/NoActionExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class NoActionExecutor extends TriggerExecutor {
  /** 无操作。 */
  execute(): void {}
}
