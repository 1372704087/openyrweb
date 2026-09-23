/**
 * NodeHeap — A* 开放集用的二叉最小堆。
 *
 * 以节点 fScore 为比较键；每个节点带 heapIndex 字段做原位定位，
 * 便于 open 集合里的 updateItem 在堆变动后 re-heapify。
 * 构造时对传入数组先 heapify 再写回各节点下标。
 *
 * 由 game/map/pathFinder/NodeHeap.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时
 * 优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 堆内节点（fScore + heapIndex，可挂其他字段）。 */
export type HeapItem = any;

/** 最小二叉堆（按 compare，默认 fScore 升序）。 */
export class NodeHeap {
  /** 底层存储（前 length 个有效）。 */
  data: HeapItem[];
  /** 当前有效元素个数。 */
  length: number;

  constructor(data: HeapItem[] = []) {
    this.data = data;
    this.length = data.length;
    if (0 < this.length) {
      // 自底向上 heapify（从最后一个非叶子开始）
      for (let i = this.length >> 1; 0 <= i; i--) this.down(i);
    }
    // 同步各节点的 heapIndex
    for (let i = 0; i < this.length; ++i) this.setNodeId(this.data[i], i);
  }

  /** 比较两节点：返回 <0 表示 a 优先（默认按 fScore）。 */
  compare(a: HeapItem, b: HeapItem): number {
    return a.fScore - b.fScore;
  }

  setNodeId(item: HeapItem, index: number): void {
    item.heapIndex = index;
  }

  push(item: HeapItem): void {
    this.data.push(item);
    this.setNodeId(item, this.length);
    this.length++;
    this.up(this.length - 1);
  }

  /** 弹出堆顶（空堆返回 undefined）。 */
  pop(): HeapItem | undefined {
    if (0 !== this.length) {
      const top = this.data[0];
      this.length--;
      if (0 < this.length) {
        // 末尾元素上提到根再下沉
        this.data[0] = this.data[this.length];
        this.setNodeId(this.data[0], 0);
        this.down(0);
      }
      this.data.pop();
      return top;
    }
  }

  peek(): HeapItem | undefined {
    return this.data[0];
  }

  /** 更新下标 index 处节点后重新堆化（先下沉再上浮）。 */
  updateItem(index: number): void {
    this.down(index);
    this.up(index);
  }

  /** 从 index 向上浮到合适位置。 */
  up(index: number): void {
    const arr = this.data;
    const item = arr[index];
    for (; 0 < index; ) {
      const parent = (index - 1) >> 1;
      const parentItem = arr[parent];
      if (0 <= this.compare(item, parentItem)) break;
      // 父更大 → 下移
      arr[index] = parentItem;
      this.setNodeId(parentItem, index);
      index = parent;
    }
    arr[index] = item;
    this.setNodeId(item, index);
  }

  /** 从 index 向下沉到合适位置。 */
  down(index: number): void {
    const arr = this.data;
    const half = this.length >> 1;
    const item = arr[index];
    for (; index < half; ) {
      let child = 1 + (index << 1);
      const right = child + 1;
      let childItem = arr[child];
      // 取较小子节点
      if (right < this.length && this.compare(arr[right], childItem) < 0) {
        child = right;
        childItem = arr[child];
      }
      if (0 <= this.compare(childItem, item)) break;
      // 子更小 → 上移
      arr[index] = childItem;
      this.setNodeId(childItem, index);
      index = child;
    }
    arr[index] = item;
    this.setNodeId(item, index);
  }
}
