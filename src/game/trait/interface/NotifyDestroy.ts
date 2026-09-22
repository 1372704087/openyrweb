/**
 * NotifyDestroy — trait 通知接口（Symbol 键）。
 *
 * 对象被摧毁时回调：onDestroy。GameObject 上挂载本接口的 trait
 * （如 SpawnDebrisTrait、TiberiumTreeTrait 等）据此产生碎屑/掉落。
 *
 * 由 game/trait/interface/NotifyDestroy.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export const NotifyDestroy = {
  onDestroy: Symbol(),
};
