/**
 * NotifyAllianceChange — trait 通知接口（Symbol 键）。
 *
 * 玩家同盟关系变化时回调：onChange。GameObject 上挂载本接口的 trait
 * （如 SharedDetectDisguiseTrait 等）据此刷新共享视野/伪装检测。
 *
 * 由 game/trait/interface/NotifyAllianceChange.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export const NotifyAllianceChange = {
  onChange: Symbol(),
};
