/**
 * SearchStatePool — A* 搜索状态的对象池 + NodeSearchState 定义。
 *
 * makeSearchStatePool 返回 { createNewState, reset }：createNewState
 * 优先复用池中已有状态（重置各字段），耗尽则新建；reset 把游标归零，
 * 下次 create 从头复用。避免每次寻路 GC 大量短命对象。
 *
 * 由 game/map/pathFinder/SearchStatePool.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 单次寻路中与图节点一一对应的状态。 */
export class NodeSearchState {
  /** 对应的图节点。 */
  node: any;
  /** 父状态（回溯路径用）。 */
  parent: NodeSearchState | undefined;
  /** 是否已关闭（弹出后不再松弛）。 */
  closed: boolean;
  /** 0=未入 open，1=已在 open。 */
  open: number;
  /** g 值：起点到本节点的累计代价。 */
  distanceToSource: number;
  /** f 值 = g + h。 */
  fScore: number;
  /** 在 NodeHeap 中的下标。 */
  heapIndex: number;

  constructor(node: any) {
    this.node = node;
    this.closed = false;
    this.open = 0;
    this.distanceToSource = Number.POSITIVE_INFINITY;
    this.fScore = Number.POSITIVE_INFINITY;
    this.heapIndex = -1;
  }
}

/** 池句柄：可复用的 NodeSearchState 工厂。 */
export type SearchStatePool = {
  createNewState(node: any): NodeSearchState;
  reset(): void;
};

/**
 * 新建一个搜索状态池。
 * 与孪生一致：首次调用在 execute 阶段注册 NodeSearchState 类之后才可用
 * （ESM 下类提升为顶层定义，无此限制）。
 */
export function makeSearchStatePool(): SearchStatePool {
  let cursor = 0;
  const pool: NodeSearchState[] = [];
  return {
    createNewState(node: any) {
      let state = pool[cursor];
      if (state) {
        state.node = node;
        state.parent = undefined;
        state.closed = false;
        state.open = 0;
        state.distanceToSource = Number.POSITIVE_INFINITY;
        state.fScore = Number.POSITIVE_INFINITY;
        state.heapIndex = -1;
      } else {
        state = new NodeSearchState(node);
        pool[cursor] = state;
      }
      cursor++;
      return state;
    },
    reset() {
      cursor = 0;
    },
  };
}
