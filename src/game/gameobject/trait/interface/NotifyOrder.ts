/**
 * NotifyOrder — trait 通知接口（Symbol 键）。
 *
 * 对象收到推送指令时回调：onPush。GameObject 上挂载本接口的 trait
 * （如 GarrisonTrait 等）据此响应入驻/装填指令。
 *
 * 由 game/gameobject/trait/interface/NotifyOrder.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
export const NotifyOrder = {
  onPush: Symbol(),
};
