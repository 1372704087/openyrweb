/**
 * NotifyDamage — trait 通知接口（Symbol 键）。
 *
 * 单位受到伤害时回调：onDamage。GameObject 上挂载本接口的 trait
 * （如 VeteranTrait 等）据此响应受击逻辑。
 *
 * 由 game/gameobject/trait/interface/NotifyDamage.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export const NotifyDamage = {
  onDamage: Symbol(),
};
