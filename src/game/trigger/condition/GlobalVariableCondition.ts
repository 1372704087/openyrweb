/**
 * GlobalVariableCondition — 全局变量取值触发条件。
 *
 * 构造第三参 value 为目标布尔（GlobalIsSet→true / IsCleared→false），
 * variableIdx = params[1]。check 读 world.triggers.getGlobalVariable
 * 并与 value 严格相等；blocking 固定 true（与基类默认 false 不同）。
 *
 * 由 game/trigger/condition/GlobalVariableCondition.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
export class GlobalVariableCondition extends TriggerCondition {
  /** 期望的全局变量值（true=set / false=clear）。 */
  value: boolean;
  /** 本条件为阻塞型（覆盖基类 false）。 */
  blocking = true;
  /** 全局变量下标（params[1]）。 */
  variableIdx: number;

  constructor(event: any, trigger: any, value: boolean) {
    super(event, trigger);
    this.value = value;
    this.blocking = true;
    this.variableIdx = Number(event.params[1]);
  }

  /** 全局变量当前值 === value 则 true。 */
  check(world: any): boolean {
    return world.triggers.getGlobalVariable(this.variableIdx) === this.value;
  }
}
