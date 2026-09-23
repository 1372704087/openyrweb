/**
 * PathFinder — 可配置的 A* 寻路工厂（单向 / 双向）。
 *
 * PathFinder(graph, options) 返回 { find(fromId, toId) }：
 * - options.bidirectional !== false（默认）走双向 A*；
 * - 否则走单向 A*。
 * 距离/启发函数可注入；excludedNodes 把节点代价抬到 Infinity；
 * bestEffort 时返回"最接近目标"的回溯路径；maxExpandedNodes 限展开数。
 * 双向会合后按 [backward 链 reverse] + [forward 父链] 拼成
 * [goal … meeting … start] 形态再由 find 语义反转为 start→goal。
 *
 * 由 game/map/pathFinder/PathFinder.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */
import { NodeHeap } from "game/map/pathFinder/NodeHeap"; // 已转换
import { makeSearchStatePool, NodeSearchState } from "game/map/pathFinder/SearchStatePool"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 默认启发：恒 0（Dijkstra 退化形态）。 */
function defaultHeuristic(): number {
  return 0;
}

/** 默认边权：恒 1。 */
function defaultDistance(): number {
  return 1;
}

/** 从 state 沿 parent 链收集节点（含当前节点，终点在前）。 */
function collectPath(state: NodeSearchState): any[] {
  const nodes = [state.node];
  let cur = state.parent;
  for (; cur; ) {
    nodes.push(cur.node);
    cur = cur.parent;
  }
  return nodes;
}

/**
 * 双向拼路：[goal 链 reverse（start→meeting）] + [backward 父链（meeting→…→goal 的节点）…]
 * 孪生实现：先沿 backward 向上收集再 reverse 得到 meeting…goal 的反向，
 * 再沿 forward 父链追加 meeting…start，最终为 [goal … start] 形态。
 */
function stitchBidirectional(fwdMeet: NodeSearchState, bwdMeet: NodeSearchState): any[] {
  const out: any[] = [];
  let r: NodeSearchState | undefined = bwdMeet;
  for (; r; ) {
    out.push(r.node);
    r = r.parent;
  }
  out.reverse();
  r = fwdMeet.parent;
  for (; r; ) {
    out.push(r.node);
    r = r.parent;
  }
  return out;
}

/** 寻路选项（与孪生 options 形状一致）。 */
export type PathFinderOptions = {
  /** true 时找不到完整路径返回最接近路径。 */
  bestEffort?: boolean;
  /** 最大弹出节点数。 */
  maxExpandedNodes?: number;
  /** 启发函数 h(a,b,state?)。 */
  heuristic?: (a: any, b: any, state?: any) => number;
  /** 边权函数 g(a,b)。 */
  distance?: (a: any, b: any) => number;
  /** 需排除（视为 Infinity 代价）的节点 data 谓词。 */
  excludedNodes?: (data: any) => boolean;
  /** false 强制单向；缺省/true 双向。 */
  bidirectional?: boolean;
};

/** find 返回类型。 */
export type PathFindResult = (fromId: any, toId: any) => any[];

/**
 * 构建一次寻路器（闭包共享一个状态池）。
 * @param graph - 需提供 getNode(id)、节点含 neighbors/data/id
 */
export function PathFinder(graph: any, options: PathFinderOptions = {}): { find: PathFindResult } {
  const bestEffort = options.bestEffort;
  const maxExpandedNodes = options.maxExpandedNodes || Number.POSITIVE_INFINITY;
  const heuristic = options.heuristic ?? defaultHeuristic;
  const distance = options.distance ?? defaultDistance;
  const excludedNodes = options.excludedNodes;
  const pool = makeSearchStatePool();
  const useBidirectional = options.bidirectional !== false;

  /** 单向 A*。 */
  function findUnidirectional(fromId: any, toId: any): any[] {
    const startNode = graph.getNode(fromId);
    if (!startNode) throw new Error("fromId is not defined in this graph: " + fromId);
    const goalNode = graph.getNode(toId);
    if (!goalNode) throw new Error("toId is not defined in this graph: " + toId);
    if (startNode === goalNode) return [];
    pool.reset();
    const states = new Map();
    const heap = new NodeHeap();
    const startState = pool.createNewState(startNode);
    states.set(fromId, startState);
    startState.fScore = excludedNodes?.(goalNode.data)
      ? Number.POSITIVE_INFINITY
      : heuristic(startNode, goalNode);
    // 起点启发已 Infinity 且与终点相邻 → 空路径（直接可达视作"无需走"）
    if (!Number.isFinite(startState.fScore) && startNode.neighbors.has(goalNode)) return [];
    startState.distanceToSource = 0;
    heap.push(startState);
    startState.open = 1;
    let best = startState;
    let expanded = 0;
    for (; 0 < heap.length; ) {
      const state = heap.pop()!;
      if (state.node === goalNode) return collectPath(state);
      expanded++;
      if (expanded > maxExpandedNodes) break;
      state.closed = true;
      state.node.neighbors.forEach((neighbour: any) => {
        let ns = states.get(neighbour.id);
        if (!ns) {
          ns = pool.createNewState(neighbour);
          states.set(neighbour.id, ns);
        }
        if (ns.closed) return;
        if (0 === ns.open) {
          heap.push(ns);
          ns.open = 1;
        }
        const tentative = excludedNodes?.(neighbour.data)
          ? Number.POSITIVE_INFINITY
          : state.distanceToSource + distance(state.node, neighbour);
        if (tentative >= ns.distanceToSource) return;
        ns.parent = state;
        ns.distanceToSource = tentative;
        ns.fScore = excludedNodes?.(goalNode.data)
          ? Number.POSITIVE_INFINITY
          : tentative + heuristic(ns.node, goalNode, ns);
        // 维护"剩余启发最小"的 bestEffort 候选
        if (ns.fScore - ns.distanceToSource < best.fScore - best.distanceToSource) best = ns;
        heap.updateItem(ns.heapIndex);
      });
    }
    return bestEffort ? collectPath(best) : [];
  }

  /** 双向 A*：前向 start→goal 与后向 goal→start 交替展开。 */
  function findBidirectional(fromId: any, toId: any): any[] {
    const startNode = graph.getNode(fromId);
    if (!startNode) throw new Error("fromId is not defined in this graph: " + fromId);
    const goalNode = graph.getNode(toId);
    if (!goalNode) throw new Error("toId is not defined in this graph: " + toId);
    if (startNode === goalNode) return [];
    pool.reset();
    // Forward: start -> goal
    const fwdHeap = new NodeHeap();
    const fwdStates = new Map();
    const fwdStart = pool.createNewState(startNode);
    fwdStates.set(fromId, fwdStart);
    fwdStart.fScore = excludedNodes?.(goalNode.data)
      ? Number.POSITIVE_INFINITY
      : heuristic(startNode, goalNode);
    if (!Number.isFinite(fwdStart.fScore) && startNode.neighbors.has(goalNode)) return [];
    fwdStart.distanceToSource = 0;
    fwdHeap.push(fwdStart);
    fwdStart.open = 1;
    // Backward: goal -> start
    const bwdHeap = new NodeHeap();
    const bwdStates = new Map();
    const bwdStart = pool.createNewState(goalNode);
    bwdStates.set(toId, bwdStart);
    bwdStart.fScore = excludedNodes?.(startNode.data)
      ? Number.POSITIVE_INFINITY
      : heuristic(goalNode, startNode);
    if (!Number.isFinite(bwdStart.fScore) && goalNode.neighbors.has(startNode)) return [];
    bwdStart.distanceToSource = 0;
    bwdHeap.push(bwdStart);
    bwdStart.open = 1;
    let bestFwd = fwdStart;
    let bestBwd = bwdStart;
    let expandedCount = 0;
    for (; 0 < fwdHeap.length && 0 < bwdHeap.length; ) {
      // Forward step
      const fwd = fwdHeap.pop()!;
      fwd.closed = true;
      expandedCount++;
      if (expandedCount > maxExpandedNodes) break;
      const bwdMeet = bwdStates.get(fwd.node.id);
      if (bwdMeet && bwdMeet.closed) return stitchBidirectional(fwd, bwdMeet);
      fwd.node.neighbors.forEach((neighbour: any) => {
        let ns = fwdStates.get(neighbour.id);
        if (!ns) {
          ns = pool.createNewState(neighbour);
          fwdStates.set(neighbour.id, ns);
        }
        if (ns.closed) return;
        if (0 === ns.open) {
          fwdHeap.push(ns);
          ns.open = 1;
        }
        const tentative = excludedNodes?.(neighbour.data)
          ? Number.POSITIVE_INFINITY
          : fwd.distanceToSource + distance(fwd.node, neighbour);
        if (tentative >= ns.distanceToSource) return;
        ns.parent = fwd;
        ns.distanceToSource = tentative;
        ns.fScore = excludedNodes?.(goalNode.data)
          ? Number.POSITIVE_INFINITY
          : tentative + heuristic(ns.node, goalNode, ns);
        if (ns.fScore - ns.distanceToSource < bestFwd.fScore - bestFwd.distanceToSource) bestFwd = ns;
        fwdHeap.updateItem(ns.heapIndex);
      });
      // Backward step
      const bwd = bwdHeap.pop()!;
      bwd.closed = true;
      expandedCount++;
      if (expandedCount > maxExpandedNodes) break;
      const fwdMeet = fwdStates.get(bwd.node.id);
      if (fwdMeet && fwdMeet.closed) return stitchBidirectional(fwdMeet, bwd);
      bwd.node.neighbors.forEach((neighbour: any) => {
        let ns = bwdStates.get(neighbour.id);
        if (!ns) {
          ns = pool.createNewState(neighbour);
          bwdStates.set(neighbour.id, ns);
        }
        if (ns.closed) return;
        if (0 === ns.open) {
          bwdHeap.push(ns);
          ns.open = 1;
        }
        const tentative = excludedNodes?.(neighbour.data)
          ? Number.POSITIVE_INFINITY
          : bwd.distanceToSource + distance(bwd.node, neighbour);
        if (tentative >= ns.distanceToSource) return;
        ns.parent = bwd;
        ns.distanceToSource = tentative;
        ns.fScore = excludedNodes?.(startNode.data)
          ? Number.POSITIVE_INFINITY
          : tentative + heuristic(ns.node, startNode, ns);
        if (ns.fScore - ns.distanceToSource < bestBwd.fScore - bestBwd.distanceToSource) bestBwd = ns;
        bwdHeap.updateItem(ns.heapIndex);
      });
    }
    // bestEffort fallback：比较两侧候选的 f-g，取更优一侧回溯
    if (bestEffort) {
      const x = bestFwd.fScore - bestFwd.distanceToSource;
      const n = bestBwd.fScore - bestBwd.distanceToSource;
      return x <= n ? collectPath(bestFwd) : collectPath(bestBwd).reverse();
    }
    return [];
  }

  return {
    find: useBidirectional ? findBidirectional : findUnidirectional,
  };
}
