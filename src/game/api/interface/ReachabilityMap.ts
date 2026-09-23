/**
 * ReachabilityMap — 可达性查询视图（type-only）。
 *
 * 由 MapApi.getReachabilityMap(regionA, regionB) 返回：getRegionId 读
 * 岛屿/区域 id 映射，isReachable 比较两节点 region 是否相同且非 undefined。
 * 方法挂在对象字面量上，依赖 this 绑定（以方法调用）。
 *
 * 由 game/api/interface/ReachabilityMap.ts.js 重写为 TS。
 * 孪生 SystemJS 注册后 execute 为空（无运行时导出）；本文件仅以
 * export interface 声明类型，export {} 保持与孪生一致的零运行时导出。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */
import type { PathNode } from "game/api/interface/PathNode"; // 已转换

/** 可达性映射（type-only，运行时无导出对象）。 */
export interface ReachabilityMap {
  /** 两节点是否落在同一可达 region。 */
  isReachable(node: PathNode, other: PathNode): any;
  /** 取节点所属 region id（可能为 undefined）。 */
  getRegionId(node: PathNode): any;
}

export {};
