/**
 * PathNode — 寻路结果中的单个节点（type-only）。
 *
 * MapApi.findPath 返回 { tile, onBridge }[]；excludeNodes 谓词也接收
 * 同形状对象（onBridge 在谓词侧被 !! 规范化为 boolean）。
 *
 * 由 game/api/interface/PathNode.ts.js 重写为 TS。
 * 孪生 SystemJS 注册后 execute 为空（无运行时导出）；本文件仅以
 * export interface 声明类型，export {} 保持与孪生一致的零运行时导出。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
/** 寻路节点（type-only，运行时无导出对象）。 */
export interface PathNode {
  /** 节点所在 tile。 */
  tile: any;
  /** 是否在桥上。 */
  onBridge: any;
}

export {};
