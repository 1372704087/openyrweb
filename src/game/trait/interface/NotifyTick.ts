/**
 * NotifyTick — trait 通知接口（Symbol 键）。
 *
 * 每逻辑 tick 回调：onTick。挂在玩家/世界上的 trait
 * （如 PowerTrait、RadarTrait 等）据此做周期性计算。
 *
 * 由 game/trait/interface/NotifyTick.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export const NotifyTick = {
  onTick: Symbol(),
};
