/**
 * NotifyTick — trait 通知接口（Symbol 键）。
 *
 * 每逻辑 tick 回调：所有需要随模拟推进的 trait 实现此钩子。
 * 每个接口是一个以 Symbol 为键的命名空间：trait 实现时把自己的方法挂到
 * trait[NotifyTick.onTick]（Symbol 键）上，引擎经 GameObject 统一广播。Symbol 键保证不会与用户属性冲突。本文件由 NotifyTick.ts.js 重写为 TS（行为完全一致），
 * 存续期间以本文件为修改目标。
 */
export const NotifyTick = {
  onTick: Symbol(),
};
