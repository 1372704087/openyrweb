/**
 * NotifyUnspawn — trait 通知接口（Symbol 键）。
 *
 * 对象离开战场时回调（回收/出售）。
 * 每个接口是一个以 Symbol 为键的命名空间：trait 实现时把自己的方法挂到
 * trait[NotifyUnspawn.onUnspawn]（Symbol 键）上，引擎经 GameObject 统一广播。Symbol 键保证不会与用户属性冲突。本文件由 NotifyUnspawn.ts.js 重写为 TS（行为完全一致），
 * 存续期间以本文件为修改目标。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export const NotifyUnspawn = {
  onUnspawn: Symbol(),
};
