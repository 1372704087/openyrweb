/**
 * NotifyTargetDestroy — 世界级 trait 通知接口（Symbol 键）。
 *
 * 攻击目标被销毁时回调（onDestroy）。世界级 traits（如 AI/索敌）据此
 * 感知目标消失并清理引用。
 *
 * 由 game/trait/interface/NotifyTargetDestroy.ts.js 重写为 TS（行为完全
 * 一致）。两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
export const NotifyTargetDestroy = {
  onDestroy: Symbol(),
};
