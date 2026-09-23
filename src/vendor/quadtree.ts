/**
 * vendor/quadtree — @timohausmann/quadtree-ts 最小实现（四叉树 + 圆形碰撞体）。
 *
 * Circle：{x,y,r,data} 圆形对象；Quadtree：按 bounds 递归分叉，
 * 超过 maxObjects 且未达 maxLevels 时 _split 为 4 象限，插入时按
 * _getIndex 归位；retrieve 收集与查询圆相交的对象（含兄弟节点）。
 * Quadtree.Branch 为工厂：返回 new Quadtree(options)（与原型方法共享）。
 *
 * 由 vendor/quadtree.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/** 圆形查询/存储对象。 */
export class Circle {
  /** 圆心 x。 */
  x: number;
  /** 圆心 y。 */
  y: number;
  /** 半径。 */
  r: number;
  /** 附带数据。 */
  data: unknown;

  constructor(options: { x: number; y: number; r: number; data?: unknown }) {
    (this.x = options.x), (this.y = options.y), (this.r = options.r), (this.data = options.data);
  }
}

/** 四叉树构造选项。 */
export interface QuadtreeOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  maxObjects?: number;
  maxLevels?: number;
  level?: number;
}

export class Quadtree {
  /** 边界盒。 */
  bounds: { x: number; y: number; width: number; height: number };
  /** 单节点容量上限（超出且未分叉满层则 split）。 */
  maxObjects: number;
  /** 最大递归层数。 */
  maxLevels: number;
  /** 当前层（根为 0）。 */
  level: number;
  /** 当前节点存放的对象。 */
  objects: Circle[];
  /** 四个子节点（未 split 时为空）。 */
  nodes: Quadtree[];

  constructor(options?: QuadtreeOptions) {
    const o = options || {};
    (this.bounds = { x: o.x || 0, y: o.y || 0, width: o.width || 0, height: o.height || 0 }),
      (this.maxObjects = o.maxObjects || 10),
      (this.maxLevels = o.maxLevels || 4),
      (this.level = o.level || 0),
      (this.objects = []),
      (this.nodes = []);
  }

  /** 清空对象与子节点。 */
  clear(): void {
    (this.objects = []), (this.nodes = []);
  }

  /** 按中点均分为 4 个 Branch 子节点（level+1）。 */
  private _split(): void {
    const b = this.bounds;
    const x = b.x;
    const y = b.y;
    const w = b.width / 2;
    const h = b.height / 2;
    const next = this.level + 1;
    const maxObjects = this.maxObjects;
    const maxLevels = this.maxLevels;
    this.nodes = [
      new Quadtree({ x: x, y: y, width: w, height: h, level: next, maxObjects, maxLevels }),
      new Quadtree({ x: x + w, y: y, width: w, height: h, level: next, maxObjects, maxLevels }),
      new Quadtree({ x: x, y: y + h, width: w, height: h, level: next, maxObjects, maxLevels }),
      new Quadtree({ x: x + w, y: y + h, width: w, height: h, level: next, maxObjects, maxLevels }),
    ];
  }

  /**
   * 判定圆应落入的子象限索引：
   * 0=左上 1=右上 2=左下 3=右下；跨中线或跨界 → -1（留在本节点）。
   */
  private _getIndex(circle: Circle): number {
    const b = this.bounds;
    const midX = b.x + b.width / 2;
    const midY = b.y + b.height / 2;
    const rightOf = circle.x - circle.r >= midX;
    const leftOf = circle.x + circle.r < midX;
    const above = circle.y + circle.r < midY;
    const below = circle.y - circle.r >= midY;
    return leftOf
      ? above
        ? 0
        : below
          ? 2
          : -1
      : rightOf
        ? above
          ? 1
          : below
            ? 3
            : -1
        : -1;
  }

  /** 插入圆：能归入子节点则递归，否则放入本节点并在超限时 split 重分布。 */
  insert(circle: Circle): void {
    if (this.nodes.length) {
      const index = this._getIndex(circle);
      if (-1 !== index) return void this.nodes[index].insert(circle);
    }
    this.objects.push(circle);
    if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
      this.nodes.length || this._split();
      for (let i = this.objects.length - 1; i >= 0; i--) {
        const child = this._getIndex(this.objects[i]);
        -1 !== child && this.nodes[child].insert(this.objects.splice(i, 1)[0]);
      }
    }
  }

  /** 递归收集：先灌入本节点，再沿命中子节点 + 相交兄弟节点下钻。 */
  private _retrieve(circle: Circle, out: Circle[]): void {
    const count = this.objects.length;
    for (let i = 0; i < count; i++) out.push(this.objects[i]);
    if (this.nodes.length) {
      const index = this._getIndex(circle);
      -1 !== index && this.nodes[index]._retrieve(circle, out);
      for (let n = 0; n < this.nodes.length; n++)
        n !== index && this._boundsIntersect(circle, this.nodes[n].bounds) && this.nodes[n]._retrieve(circle, out);
    }
  }

  /** 圆与矩形边界相交（轴对齐重叠测试）。 */
  private _boundsIntersect(circle: Circle, bounds: { x: number; y: number; width: number; height: number }): boolean {
    const left = circle.x - circle.r;
    const right = circle.x + circle.r;
    const top = circle.y - circle.r;
    const bottom = circle.y + circle.r;
    return left <= bounds.x + bounds.width && right >= bounds.x && top <= bounds.y + bounds.height && bottom >= bounds.y;
  }

  /** 查询与 circle 相交的对象列表。 */
  retrieve(circle: Circle): Circle[] {
    const out: Circle[] = [];
    return this._retrieve(circle, out), out;
  }
}

/**
 * Branch 工厂：与原型方法共享的构造捷径。
 * 孪生写法 `Quadtree.Branch = function(e) { return new Quadtree(e); }`，
 * 调用方经 new Quadtree.Branch(opts) 或 Quadtree.Branch(opts) 均得到
 * 一个常规 Quadtree 实例（new 工厂函数的返回值仍是 new 的对象本身，
 * 但函数显式 return 对象时 new 结果即该对象——与孪生一致）。
 */
(Quadtree as any).Branch = function (options?: QuadtreeOptions) {
  return new Quadtree(options);
};
