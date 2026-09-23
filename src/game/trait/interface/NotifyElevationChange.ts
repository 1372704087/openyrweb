/**
 * NotifyElevationChange — trait 通知接口（Symbol 键）。海拔变化回调。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export const NotifyElevationChange = {
  onElevationChange: Symbol(),
};
