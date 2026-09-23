/**
 * GlobalVariableExecutor — 设置/清除全局变量。
 *
 * 工厂以 GlobalSet(true)/GlobalClear(false) 构造；params[1]=变量 idx，
 * 转发到 TriggerManager.toggleGlobalVariable。
 *
 * 由 game/trigger/executor/GlobalVariableExecutor.ts.js 重写为 TS。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerExecutor } from "game/trigger/TriggerExecutor"; // 本组已写

/* eslint-disable @typescript-eslint/no-explicit-any */
export class GlobalVariableExecutor extends TriggerExecutor {
  /** 写入的布尔值（true=set / false=clear）。 */
  readonly value: boolean;
  /** 全局变量下标。 */
  readonly variableIdx: number;

  constructor(action: any, trigger: any, value: boolean) {
    super(action, trigger);
    this.value = value;
    this.variableIdx = Number(action.params[1]);
  }

  execute(game: any): void {
    game.triggers.toggleGlobalVariable(this.variableIdx, this.value);
  }
}
