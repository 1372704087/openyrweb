/**
 * NotifyTileChange — trait 通知接口（Symbol 键）。tile 变化回调（game/trait 命名空间版本）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export const NotifyTileChange = {
  onTileChange: Symbol(),
};
