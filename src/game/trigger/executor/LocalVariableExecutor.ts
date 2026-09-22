/**
 * LocalVariableExecutor — 设置/清除本地变量。
 *
 * 第三参 value（LocalSet→true / LocalClear→false），
 * variableIdx = params[1]。execute 调
 * world.triggers.toggleLocalVariable(idx, value)。
 *
 * 由 game/trigger/executor/LocalVariableExecutor.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */
export class LocalVariableExecutor extends TriggerExecutor {
  /** 目标值（true=set / false=clear）。 */
  value: boolean;
  /** 本地变量下标（params[1]）。 */
  variableIdx: number;

  constructor(action: any, trigger: any, value: boolean) {
    super(action, trigger);
    this.value = value;
    this.variableIdx = Number(action.params[1]);
  }

  /** 写入本地变量。 */
  execute(world: any): void {
    world.triggers.toggleLocalVariable(this.variableIdx, this.value);
  }
}
