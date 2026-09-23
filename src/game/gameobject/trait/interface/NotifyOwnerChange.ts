/**
 * NotifyOwnerChange — trait 通知接口（Symbol 键）。
 *
 * 对象更换所属玩家时回调（如被渗透/占领）。
 * 每个接口是一个以 Symbol 为键的命名空间：trait 实现时把自己的方法挂到
 * trait[NotifyOwnerChange.onChange]（Symbol 键）上，引擎经 GameObject 统一广播。Symbol 键保证不会与用户属性冲突。本文件由 NotifyOwnerChange.ts.js 重写为 TS（行为完全一致），
 * 存续期间以本文件为修改目标。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export const NotifyOwnerChange = {
  onChange: Symbol(),
};
