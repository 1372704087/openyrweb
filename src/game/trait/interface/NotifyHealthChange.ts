/**
 * NotifyHealthChange — trait 通知接口（Symbol 键）。
 *
 * 血量变化时回调（扣血/回血均可触发）：挂载本接口的 trait
 * 可通过 trait[NotifyHealthChange.onChange] 响应生命值变更，
 * 典型用途是刷新 sidebar / 占用条 / 修理按钮等。
 *
 * 由 game/trait/interface/NotifyHealthChange.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export const NotifyHealthChange = {
  onChange: Symbol(),
};
