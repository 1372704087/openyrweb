/**
 * QuadTree — 按点键插入的空间四叉树。
 *
 * 对象通过 config.getKey(obj) 映射到平面上的点；节点在 splitThreshold
 * 分裂、joinThreshold 合并，父指针经共享 parentMap 跨层定位。
 *
 * 由 util/QuadTree.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/** 点/盒结构（复用 THREE.Box2 / Vector2 形状）。 */
type Point2 = { x: number; y: number };
type Box2Like = {
  min: Point2;
  max: Point2;
  containsPoint(p: Point2): boolean;
  intersectsBox(b: Box2Like): boolean;
  getCenter(target?: Point2): Point2;
  clone(): Box2Like;
};

/** 四叉树配置。 */
export interface QuadTreeConfig<T> {
  /** 对象 → 平面点键 */
  getKey(value: T): Point2;
  /** 合并阈值：子节点合计对象数 ≤ 此值时 join */
  joinThreshold: number;
  /** 分裂阈值：叶子对象数 ≥ 此值时 split */
  splitThreshold: number;
  /** 最大深度（≤1 时不再分裂） */
  maxDepth: number;
}

/** 叶子节点中的条目。 */
interface QuadEntry<T> {
  key: Point2;
  value: T;
}

/** 模块级暂存向量：generateRegions 取中心复用（必须是 THREE.Vector2，Box2.getCenter 会 addVectors）。 */
const scratchVector2: Point2 = new (THREE as any).Vector2();

export class QuadTree<T> {
  box: Box2Like;
  config: QuadTreeConfig<T>;
  parentMap = new Map<T, QuadTree<T>>();
  objects: QuadEntry<T>[] = [];
  /** 非叶子时的四个象限；undefined 表示叶子 */
  regions?: QuadTree<T>[];
  parent?: QuadTree<T>;

  constructor(box: Box2Like, config: QuadTreeConfig<T>) {
    this.box = box;
    this.config = config;
    this.parentMap = new Map();
    this.objects = [];
  }

  /** 插入对象；键在 box 内才成功。update=true 时触发分裂/合并。 */
  add(value: T, update: boolean = true): boolean {
    const key = this.config.getKey(value);
    if (this.box.containsPoint(key)) {
      if (!this.regions) {
        this.parentMap.get(value)?.remove(value);
        this.parentMap.set(value, this);
        this.objects.push({ key, value });
        if (update) this.update();
        return true;
      }
      for (const region of this.regions) {
        if (region.add(value, update)) return true;
      }
    }
    return false;
  }

  /** 经 parentMap 定位持有节点后移除；非本节点时下钻。 */
  remove(value: T, update: boolean = true): void {
    const owner = this.parentMap.get(value);
    if (owner) {
      if (owner === this) {
        this.parentMap.delete(value);
        this.objects.splice(
          this.objects.findIndex((entry) => entry.value === value),
          1,
        );
        if (update) this.parent?.update();
      } else {
        owner.remove(value, update);
      }
    }
  }

  /** 键移动后刷新：仍在本 box 则改 key，否则迁出并沿祖先重插。 */
  updateObject(value: T): void {
    const owner = this.parentMap.get(value);
    if (owner) {
      const key = this.config.getKey(value);
      if (owner.box.containsPoint(key)) {
        owner.objects.find((entry) => entry.value === value)!.key = key;
      } else {
        owner.remove(value, false);
        let node: QuadTree<T> | undefined = owner.parent;
        while (node && !node.add(value, false)) {
          node = node.parent;
        }
      }
    }
  }

  /** 矩形范围查询，命中写入 results（缺省新数组）并返回。 */
  queryRange(range: Box2Like, results: T[] = []): T[] {
    if (this.box.intersectsBox(range)) {
      if (this.regions) {
        for (const region of this.regions) region.queryRange(range, results);
      } else {
        for (const entry of this.objects) {
          if (range.containsPoint(entry.key)) results.push(entry.value);
        }
      }
    }
    return results;
  }

  /** 递归统计/再平衡：叶子达 splitThreshold 则分裂；子合计 ≤ joinThreshold 则合并。 */
  update(): number {
    let count = 0;
    if (this.regions) {
      for (const region of this.regions) count += region.update();
      if (count <= this.config.joinThreshold) this.join();
    } else {
      count = this.objects.length;
      if (count >= this.config.splitThreshold && this.split()) this.update();
    }
    return count;
  }

  /** 分成四象限并重插当前对象；已分裂或 maxDepth≤1 时返回 false。 */
  split(): boolean {
    if (this.regions || this.config.maxDepth <= 1) return false;
    const childConfig: QuadTreeConfig<T> = {
      getKey: this.config.getKey,
      joinThreshold: this.config.joinThreshold,
      splitThreshold: this.config.splitThreshold,
      maxDepth: this.config.maxDepth - 1,
    };
    const boxes = this.generateRegions();
    const prior = this.objects;
    this.objects = [];
    this.regions = [];
    for (const childBox of boxes) {
      const child = new QuadTree<T>(childBox, childConfig);
      child.parentMap = this.parentMap;
      this.regions.push(child);
      child.parent = this;
    }
    for (const entry of prior) {
      this.parentMap.delete(entry.value);
      this.add(entry.value, false);
    }
    return true;
  }

  /** 四象限向上合并；非分裂节点返回 false。 */
  join(): boolean {
    if (!this.regions) return false;
    for (const region of this.regions) {
      region.join();
      region.parent = undefined;
      for (const entry of region.objects) {
        this.objects.push(entry);
        this.parentMap.set(entry.value, this);
      }
    }
    // 孪生: return !(this.regions = void 0) → 赋值结果 undefined，!undefined === true
    this.regions = undefined;
    return !this.regions;
  }

  /** 把 box 按中心十字切成四块（先左右再上下）。 */
  generateRegions(): Box2Like[] {
    const list: Box2Like[] = [this.box.clone()];
    const center = this.box.getCenter(scratchVector2 as any) as Point2;
    let left = list[0];
    let right = left.clone();
    left.max.x = center.x;
    right.min.x = center.x;
    list.push(right);
    for (let i = 0, len = list.length; i < len; i++) {
      const box = list[i];
      const clone = box.clone();
      box.max.y = center.y;
      clone.min.y = center.y;
      list.push(clone);
    }
    return list;
  }
}
