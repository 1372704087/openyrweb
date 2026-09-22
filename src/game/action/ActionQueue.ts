/**
 * ActionQueue — 动作队列（本帧/本 tick 待处理的 Action 列表）。
 *
 * push 入队，getLast / dequeueLast / dequeueAll / clear 出队或清空；
 * dequeueAll 会拷贝并清空底层数组。
 *
 * 由 game/action/ActionQueue.ts.js 重写为 TS（行为完全一致）。两个文件
 * 并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts
 * 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ActionQueue {
  // 字段一律不带初始化器：孪生构造函数按固定顺序赋值。
  actions: any[];

  constructor() {
    this.actions = [];
  }

  /** 追加一个或多个动作到队尾。 */
  push(...actions: any[]): void {
    this.actions.push(...actions);
  }

  /** 查看队尾动作（不移除）。 */
  getLast(): any {
    return this.actions[this.actions.length - 1];
  }

  /** 取出全部动作并清空队列。 */
  dequeueAll(): any[] {
    const all = [...this.actions];
    this.actions.length = 0;
    return all;
  }

  /** 弹出队尾动作。 */
  dequeueLast(): any {
    return this.actions.pop();
  }

  /** 清空队列。 */
  clear(): void {
    this.actions.length = 0;
  }
}
