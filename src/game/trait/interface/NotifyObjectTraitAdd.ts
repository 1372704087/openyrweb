/**
 * NotifyObjectTraitAdd — 世界级 trait 通知接口（Symbol 键）。
 *
 * 向 GameObject 动态挂载 trait 时回调（onAdd）。世界 traits 上实现本
 * 接口的监听者可感知对象 trait 运行时增减（如调试/同步系统）。
 *
 * 由 game/trait/interface/NotifyObjectTraitAdd.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
export const NotifyObjectTraitAdd = {
  onAdd: Symbol(),
};
