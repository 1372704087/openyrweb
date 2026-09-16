/**
 * NotifySell — trait 通知接口（Symbol 键）。
 *
 * 建筑被出售时回调（码头内单位疏散/出售处理）。
 * 由 game/gameobject/trait/interface/NotifySell.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export const NotifySell = {
  onSell: Symbol(),
};
