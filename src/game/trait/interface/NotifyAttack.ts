/**
 * NotifyAttack — trait 通知接口（Symbol 键）。
 *
 * 玩家侧单位发起攻击时回调：挂载本接口的 trait（如共享侦测）
 * 可通过 trait[NotifyAttack.onAttack] 感知攻击事件。
 * 参数约定通常为 (attackerOrVictim, attackInfo, attacker, world)，
 * 具体以各实现/调用点为准。
 *
 * 由 game/trait/interface/NotifyAttack.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export const NotifyAttack = {
  onAttack: Symbol(),
};
