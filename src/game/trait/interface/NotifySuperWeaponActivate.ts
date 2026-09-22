/**
 * NotifySuperWeaponActivate — trait 通知接口（Symbol 键）。
 *
 * 超级武器激活时回调：onActivate。GameObject 上挂载本接口的 trait
 * （如 RadarTrait、MapShroudTrait 等）据此响应超级武器生效。
 *
 * 由 game/trait/interface/NotifySuperWeaponActivate.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export const NotifySuperWeaponActivate = {
  onActivate: Symbol(),
};
