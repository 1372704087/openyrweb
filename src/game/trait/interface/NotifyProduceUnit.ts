/**
 * NotifyProduceUnit — trait 通知接口（Symbol 键）。
 *
 * 单位从工厂产出时回调（雷达注册等）。
 * 由 game/trait/interface/NotifyProduceUnit.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export const NotifyProduceUnit = {
  onProduce: Symbol(),
};
