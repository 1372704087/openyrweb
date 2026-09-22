/**
 * LocalVariableCondition — 局部变量是否等于指定值条件。
 *
 * 由 game/trigger/condition/LocalVariableCondition.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 对应 LocalIsSet/LocalIsCleared（value 由工厂传入 true/false）：
 * blocking=true，variableIdx 取 params[1]；check 读取
 * context.triggers.getLocalVariable 并与 value 比较。
 */
import { TriggerCondition } from "game/trigger/TriggerCondition"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */
export class LocalVariableCondition extends TriggerCondition {
  /** 期望的布尔值（true=IsSet, false=IsCleared）。 */
  value: boolean;
  /** 局部变量下标（params[1]）。 */
  variableIdx: number;

  constructor(event: any, trigger: any, value: boolean) {
    super(event, trigger);
    this.value = value;
    this.blocking = !0;
    this.variableIdx = Number(event.params[1]);
  }

  /**
   * 检查局部变量当前值。
   *
   * @param context 提供 triggers.getLocalVariable 的世界上下文。
   * @returns 变量值 === this.value。
   */
  check(context: any): boolean {
    return context.triggers.getLocalVariable(this.variableIdx) === this.value;
  }
}
