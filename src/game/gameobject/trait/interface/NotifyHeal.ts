/**
 * NotifyHeal — trait 通知接口（Symbol 键）。
 *
 * 对象受到治疗时回调：宿主 GameObject 上挂载 NotifyHeal 的 trait
 * 可通过 trait[NotifyHeal.onHeal]（Symbol 键）接收治疗事件。
 * 参数约定（由调用方 HealthTrait.healBy 等传入）：
 *   healedObject — 被治疗对象；world — 世界；
 *   amount — 本次治疗量；healer — 治疗来源（可空）。
 *
 * 由 game/gameobject/trait/interface/NotifyHeal.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export const NotifyHeal = {
  onHeal: Symbol(),
};
