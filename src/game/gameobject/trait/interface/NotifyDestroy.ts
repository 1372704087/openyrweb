/**
 * NotifyDestroy — trait 通知接口（Symbol 键）。
 *
 * 对象被摧毁时回调（死前通知，仍可读取对象状态）。
 * 每个接口是一个以 Symbol 为键的命名空间：trait 实现时把自己的方法挂到
 * trait[NotifyDestroy.onDestroy]（Symbol 键）上，引擎经 GameObject 统一广播。Symbol 键保证不会与用户属性冲突。本文件由 NotifyDestroy.ts.js 重写为 TS（行为完全一致），
 * 存续期间以本文件为修改目标。
 */
export const NotifyDestroy = {
  onDestroy: Symbol(),
};
