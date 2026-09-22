/**
 * NotifyHealthChange — trait 通知接口（Symbol 键）。
 *
 * 对象生命值变化时回调（onChange）。挂在 GameObject 上实现本接口的
 * trait（如 UI 刷新、状态同步）会收到 (gameObject, world, previousHealth)
 * 通知；世界级 Legacy NotifyHealthChange（game/trait/interface）由
 * HealthTrait 同时广播。
 *
 * 由 game/gameobject/trait/interface/NotifyHealthChange.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export const NotifyHealthChange = {
  onChange: Symbol(),
};
