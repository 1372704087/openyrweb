/**
 * NotifyPlaceBuilding — trait 通知接口（Symbol 键）。
 *
 * 玩家成功放置建筑时回调：挂载本接口的 trait
 * 可通过 trait[NotifyPlaceBuilding.onPlace] 感知放置完成
 * （通常在建筑正式 spawn 前后用于计数与 UI 刷新）。
 *
 * 由 game/trait/interface/NotifyPlaceBuilding.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export const NotifyPlaceBuilding = {
  onPlace: Symbol(),
};
