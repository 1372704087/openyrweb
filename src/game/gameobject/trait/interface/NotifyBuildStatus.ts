/**
 * NotifyBuildStatus — trait 通知接口（Symbol 键）。
 *
 * 建筑建造状态变化（建造成形 BuildUp ↔ 就绪 Ready ↔ 拆除 BuildDown）
 * 时回调，订阅 trait 据此启停功能（工厂、船坞、超武充能等）。
 * 注意：Building.setBuildStatus 分发时的实参顺序是
 * (旧状态, 建筑对象, 事件总线) —— 与常规 (self, ...) 后跟业务参数的
 * 排列不同，属原实现的既定约定。
 *
 * 由 game/gameobject/trait/interface/NotifyBuildStatus.ts.js 重写为 TS
 * （行为完全一致）。两个文件并存期间，本文件才是修改目标：
 * tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
export const NotifyBuildStatus = {
  onStatusChange: Symbol(),
};
