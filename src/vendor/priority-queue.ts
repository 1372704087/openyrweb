/**
 * vendor/priority-queue — @datastructures-js/priority-queue 最小实现（二叉堆）。
 *
 * compare 缺省为数值差 (a,b)=>a-b；enqueue 尾插后上浮，dequeue 取堆顶
 * 后用末元素下沉；front/isEmpty/toArray/size 为只读窥视。
 *
 * 由 vendor/priority-queue.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/** 比较器：返回 <0 表示 a 优先于 b。 */
export type CompareFn<T> = (a: T, b: T) => number;

export class PriorityQueue<T> {
  /** 自定义比较器（缺省数值差）。 */
  readonly compare: CompareFn<T>;
  /** 底层堆数组（0 为堆顶）。 */
  readonly heap: T[];

  /**
   * @param compare - 可选比较器；缺省 (a, b) => a - b
   */
  constructor(compare?: CompareFn<T>) {
    this.compare = compare || ((a: any, b: any) => a - b);
    this.heap = [];
  }

  /** 入队并上浮到正确位置。 */
  enqueue(value: T): void {
    this.heap.push(value);
    this._bubbleUp(this.heap.length - 1);
  }

  /**
   * 出队：取堆顶，末元素补位后下沉。
   * 空堆时：heap[0] 为 undefined，pop 后 length===0 不做补位（与孪生一致）。
   */
  dequeue(): T | undefined {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last as T;
      this._sinkDown(0);
    }
    return top;
  }

  /** 查看堆顶（不移除）。 */
  front(): T | undefined {
    return this.heap[0];
  }

  /** 是否为空。 */
  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /** 堆数组浅拷贝。 */
  toArray(): T[] {
    return this.heap.slice();
  }

  /** 当前元素个数。 */
  size(): number {
    return this.heap.length;
  }

  /** 从 index 上浮：父更大则交换，直到根或已有序。 */
  private _bubbleUp(index: number): void {
    for (; index > 0; ) {
      const parent = (index - 1) >> 1;
      if (this.compare(this.heap[index], this.heap[parent]) >= 0) break;
      const tmp = this.heap[index];
      (this.heap[index] = this.heap[parent]), (this.heap[parent] = tmp), (index = parent);
    }
  }

  /** 从 index 下沉：选较小子节点交换，直到叶子或已有序。 */
  private _sinkDown(index: number): void {
    const length = this.heap.length;
    for (; ; ) {
      let smallest = index;
      const left = (index << 1) + 1;
      const right = left + 1;
      if (left < length && this.compare(this.heap[left], this.heap[smallest]) < 0) smallest = left;
      if (right < length && this.compare(this.heap[right], this.heap[smallest]) < 0) smallest = right;
      if (smallest === index) break;
      const tmp = this.heap[index];
      (this.heap[index] = this.heap[smallest]), (this.heap[smallest] = tmp), (index = smallest);
    }
  }
}
