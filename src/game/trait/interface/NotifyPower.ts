/**
 * NotifyPower — trait 通知接口（Symbol 键）。
 *
 * 玩家电力状态变化时回调：onPowerLow（进入低电力）、onPowerRestore
 * （恢复正常）、onPowerChange（任意电力数值变化，sidebar 刷新用）。
 * 三个钩子都由玩家的 PowerTrait 触发，GameObject 上挂载 NotifyPower
 * 的 trait（如 ProductionTrait）据此响应。
 *
 * 由 game/trait/interface/NotifyPower.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export const NotifyPower = {
  onPowerLow: Symbol(),
  onPowerRestore: Symbol(),
  onPowerChange: Symbol(),
};
