/**
 * RenderableContainer — 可渲染对象树容器：维护 children 集合与创建队列，
 * processRenderQueue 惰性调用子项的 create3DObject 并挂到 3D 父节点。
 *
 * 由 engine/gfx/RenderableContainer.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先
 * 采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 子项最小形状（与 Renderable 协议对齐）。 */
export interface RenderableLike {
  create3DObject?(): void;
  get3DObject?(): any;
  update?(delta?: any, time?: any): void;
}

/** RenderableContainer：容器 + 渲染队列。 */
export class RenderableContainer {
  protected container: any;
  protected children: Set<RenderableLike> = new Set();
  protected renderQueue: RenderableLike[] = [];

  constructor(object?: any) {
    if (object) this.set3DObject(object);
  }

  set3DObject(object: any): void {
    this.container = object;
  }

  get3DObject(): any {
    return this.container;
  }

  getChildren(): RenderableLike[] {
    return [...this.children];
  }

  add(...items: RenderableLike[]): void {
    for (const item of items) {
      if (!this.children.has(item)) {
        this.children.add(item);
        this.renderQueue.push(item);
      }
    }
  }

  remove(...items: RenderableLike[]): void {
    for (const item of items) {
      if (this.children.has(item)) {
        this.children.delete(item);
        const queueIndex = this.renderQueue.indexOf(item);
        if (queueIndex === -1) {
          // 不在创建队列：孪生无方法存在性守卫，仅结果与 parent 判真
          const obj = item.get3DObject();
          if (obj && obj.parent) this.get3DObject().remove(obj);
        } else {
          this.renderQueue.splice(queueIndex, 1);
        }
      }
    }
  }

  removeAll(): void {
    this.remove(...this.children);
  }

  processRenderQueue(): void {
    if (!this.get3DObject()) {
      throw new Error("A THREE.Object3D must be passed in the constructor or using the setter.");
    }
    let item: RenderableLike | undefined;
    while ((item = this.renderQueue.shift())) {
      item.create3DObject();
      const obj = item.get3DObject();
      if (obj) this.get3DObject().add(obj);
    }
  }

  create3DObject(): void {
    this.processRenderQueue();
  }

  update(delta?: any, time?: any): void {
    if (this.renderQueue.length) this.processRenderQueue();
    for (const child of this.children) {
      if (this.renderQueue.length) this.processRenderQueue();
      child.update!(delta, time);
    }
  }
}
