/**
 * TriggerExecutor — 触发器动作（Action）执行器基类。
 *
 * 每个具体 executor（executor/*）继承本类：构造时绑定一条
 * TriggerAction 与所属 TriggerInstance；execute(world, targets) 由
 * TriggerManager 按事件类型分发调用。
 *
 * getDebugName 输出形如 `triggerId[index] (triggerName).` 的调试串，
 * 供 console.warn/debug 定位未处理动作。
 *
 * 由 game/trigger/TriggerExecutor.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export class TriggerExecutor {
  /** 绑定的动作参数（含 type / params / triggerId / index）。 */
  action: any;
  /** 所属触发器实例（houseName / name 等）。 */
  trigger: any;

  constructor(action: any, trigger: any) {
    this.action = action;
    this.trigger = trigger;
  }

  /** 调试名：`{triggerId}[{index}] ({triggerName}).` */
  getDebugName(): string {
    return `${this.action.triggerId}[${this.action.index}] (${this.trigger.name}).`;
  }
}
