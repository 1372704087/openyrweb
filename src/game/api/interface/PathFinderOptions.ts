/**
 * PathFinderOptions — 寻路可选参数（type-only）。
 *
 * MapApi.findPath 的第 5 参：bestEffort / excludeNodes / maxExpandedNodes /
 * bidirectional 均直接透传给 terrain.computePath。
 *
 * 由 game/api/interface/PathFinderOptions.ts.js 重写为 TS。
 * 孪生 SystemJS 注册后 execute 为空（无运行时导出）；本文件仅以
 * export interface 声明类型，export {} 保持与孪生一致的零运行时导出。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import type { PathNode } from "game/api/interface/PathNode"; // 已转换

/** 寻路选项（type-only，运行时无导出对象）。 */
export interface PathFinderOptions {
  /** true 时尽量给出最近路径而不保证到达终点。 */
  bestEffort?: any;
  /** 排除节点谓词（入参为 { tile, onBridge }）。 */
  excludeNodes?: (node: PathNode) => any;
  /** 扩展节点数上限。 */
  maxExpandedNodes?: any;
  /** 是否双向搜索。 */
  bidirectional?: any;
}

export {};
