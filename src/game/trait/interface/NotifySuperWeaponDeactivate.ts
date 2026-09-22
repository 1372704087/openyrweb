/**
 * NotifySuperWeaponDeactivate — trait 通知接口（Symbol 键）。
 *
 * 超级武器冷却完毕后被消耗/关闭时回调：挂载本接口的 trait
 * 可通过 trait[NotifySuperWeaponDeactivate.onDeactivate] 响应
 * 超武进入冷却态（sidebar 图标变灰等）。
 * 与之配对的是 NotifySuperWeaponActivate（激活/充能完成）。
 *
 * 由 game/trait/interface/NotifySuperWeaponDeactivate.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export const NotifySuperWeaponDeactivate = {
  onDeactivate: Symbol(),
};
