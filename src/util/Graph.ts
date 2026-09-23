/**
 * Graph — 无向带权图：Node + Graph，邻居用 Set 存储。
 *
 * 由 util/Graph.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，本文件
 * 才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/**
 * 图节点。T 为业务负载类型。
 * 邻接表为 Set，插入序即遍历序。
 */
export class Node<T = unknown> {
  /** 节点 ID（在所属 Graph 内唯一，通常为 string/number）。 */
  id: unknown;
  /** 业务数据；addNode 对已存在节点会覆盖写入。 */
  data: T;
  /** 邻居集合（无向边两侧互相持有）。 */
  neighbors: Set<Node<T>>;

  constructor(id: unknown, data: T) {
    this.id = id;
    this.data = data;
    this.neighbors = new Set();
  }

  /** 建立与 other 的无向边（自环仅加一次）。 */
  addLink(other: Node<T>): void {
    this.neighbors.add(other);
    if (other !== this) other.neighbors.add(this);
  }

  /** 拆除与 other 的无向边（双向删除；不校验是否原先相连）。 */
  removeLink(other: Node<T>): void {
    this.neighbors.delete(other);
    other.neighbors.delete(this);
  }

  /** 拆除本节点全部边：先清邻居侧引用，再清自身集合。 */
  deleteLinks(): void {
    for (const neighbor of this.neighbors) neighbor.neighbors.delete(this);
    this.neighbors.clear();
  }
}

/** 按 ID 索引节点的无向图容器。 */
export class Graph<T = unknown> {
  private nodes: Map<unknown, Node<T>> = new Map();

  /**
   * 插入或更新节点：若 id 已存在则覆盖 data 并返回原节点；
   * 否则新建 Node 后写入 Map。始终返回该 id 对应的节点。
   */
  addNode(id: unknown, data: T): Node<T> {
    let node = this.getNode(id);
    if (node) node.data = data;
    else node = new Node(id, data);
    this.nodes.set(id, node);
    return node;
  }

  /** 删除节点并拆除其全部边；节点不存在返回 false，成功返回 true。 */
  removeNode(id: unknown): boolean {
    const node = this.getNode(id);
    if (!node) return false;
    node.deleteLinks();
    this.nodes.delete(id);
    return true;
  }

  hasNode(id: unknown): boolean {
    return this.nodes.has(id);
  }

  getNode(id: unknown): Node<T> | undefined {
    return this.nodes.get(id);
  }

  getNodeCount(): number {
    return this.nodes.size;
  }

  /** 按 Map 插入序遍历全部节点。 */
  forEachNode(callback: (node: Node<T>) => void): void {
    for (const node of this.nodes.values()) callback(node);
  }

  /** 逐节点拆除全部边后清空 Map（与 removeNode 链等价但更批量）。 */
  clear(): void {
    for (const node of this.nodes.values()) node.deleteLinks();
    this.nodes.clear();
  }
}
