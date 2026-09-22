/**
 * NotifyWarpChange — 世界级 trait 通知接口（Symbol 键）。
 *
 * 超时空传送进出状态变化时回调（onChange）。与
 * game/gameobject/trait/interface/NotifyWarpChange 并行：世界级 traits
 * （如 SuperWeaponsTrait 暂停计时器）与对象级 traits 各自过滤实现方。
 *
 * 由 game/trait/interface/NotifyWarpChange.ts.js 重写为 TS（行为完全一
 * 致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export const NotifyWarpChange = {
  onChange: Symbol(),
};
