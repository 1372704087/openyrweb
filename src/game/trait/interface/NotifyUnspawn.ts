/**
 * NotifyUnspawn — trait 通知接口（Symbol 键）。
 *
 * 对象离开战场（出售/摧毁/变形卸下/强制移除等）时回调：
 * 挂载本接口的 trait 可通过 trait[NotifyUnspawn.onUnspawn]
 * 做清理（取消生产队列、归还资源、释放被控目标等）。
 * 注意：本接口是 game/trait 侧（玩家/世界级 trait），与
 * game/gameobject/trait/interface/NotifyUnspawn（对象级）同名不同模块。
 *
 * 由 game/trait/interface/NotifyUnspawn.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export const NotifyUnspawn = {
  onUnspawn: Symbol(),
};
