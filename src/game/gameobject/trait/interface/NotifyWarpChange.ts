/**
 * NotifyWarpChange — trait 通知接口（Symbol 键）。
 *
 * 超时空传送进出状态变化回调（工厂队列刷新用）。
 * 由 game/gameobject/trait/interface/NotifyWarpChange.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export const NotifyWarpChange = {
  onChange: Symbol(),
};
