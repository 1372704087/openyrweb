/**
 * LazyHtmlElement — 惰性 HTML 树节点（可选根 element + children Set）。
 *
 * add/remove 管理子节点；已渲染时子节点即时 render/unrender 并挂/摘 DOM；
 * render 要求构造或 setElement 提供根元素；unrender 递归卸载。
 *
 * 由 gui/LazyHtmlElement.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 惰性 HTML 元素节点。 */
export class LazyHtmlElement {
  /** 根 DOM 元素（可选）。 */
  element?: any;
  /** 子节点集合。 */
  children = new Set<any>();
  /** 是否已渲染。 */
  rendered = false;

  /**
   * @param element - 可选根元素
   */
  constructor(element?: any) {
    this.children = new Set();
    this.rendered = false;
    if (element) this.setElement(element);
  }

  /**
   * 设置根元素。
   * @param element - DOM 节点
   */
  setElement(element: any): void {
    this.element = element;
  }

  /** 根元素。 */
  getElement(): any {
    return this.element;
  }

  /** 子节点数组拷贝。 */
  getChildren(): any[] {
    return [...this.children];
  }

  /** 是否已渲染。 */
  isRendered(): boolean {
    return this.rendered;
  }

  /**
   * 添加子节点（已渲染则立即 renderChild）。
   * @param children - 子节点列表
   */
  add(...children: any[]): void {
    for (const c of children) {
      if (!this.children.has(c)) {
        this.children.add(c);
        if (this.rendered) this.renderChild(c);
      }
    }
  }

  /**
   * 移除子节点（已渲染则立即 unrenderChild）。
   * @param children - 子节点列表
   */
  remove(...children: any[]): void {
    for (const c of children) {
      if (this.children.has(c)) {
        this.children.delete(c);
        if (this.rendered) this.unrenderChild(c);
      }
    }
  }

  /** 移除全部子节点。 */
  removeAll(): void {
    this.remove(...this.children);
  }

  /** 渲染全部子节点并标记 rendered。 */
  render(): void {
    if (!this.element) {
      throw new Error("An HTML element must be passed in the constructor or using the setter.");
    }
    this.children.forEach((c) => this.renderChild(c));
    this.rendered = true;
  }

  /**
   * 渲染单个子节点并挂到根。
   * @param child - 子节点
   */
  renderChild(child: any): void {
    child.render();
    const el = child.getElement();
    if (el) this.getElement().appendChild(el);
  }

  /**
   * 卸载单个子节点并从根摘除。
   * @param child - 子节点
   */
  unrenderChild(child: any): void {
    const el = child.getElement();
    if (el) {
      child.unrender();
      if (el.parentElement === this.getElement()) this.getElement().removeChild(el);
    }
  }

  /** 卸载全部子节点。 */
  unrender(): void {
    if (this.isRendered()) {
      this.children.forEach((c) => this.unrenderChild(c));
      this.rendered = false;
    }
  }
}
