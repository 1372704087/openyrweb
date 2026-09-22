/**
 * NotifySpawn — 世界级 trait 通知接口（Symbol 键）。
 *
 * 对象进入战场时回调（onSpawn）：出生/建造完成。与
 * game/gameobject/trait/interface/NotifySpawn 是两套并行广播——世界
 * traits 与对象 traits 各自过滤实现本接口的监听者。
 *
 * 由 game/trait/interface/NotifySpawn.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */
export const NotifySpawn = {
  onSpawn: Symbol(),
};
