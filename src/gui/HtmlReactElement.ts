/**
 * HtmlReactElement — 将 React 组件挂到 DOM 的 HtmlContainer 子类。
 *
 * factory(Component, options) 创建实例；render 时建 div 并 ReactDOM.render；
 * applyOptions 改 props 后 refresh 重渲；unrender 时 unmountComponentAtNode。
 *
 * 由 gui/HtmlReactElement.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生（第三方）
import * as ReactDOMModule from "react-dom"; // 孪生（第三方）
import { HtmlContainer } from "gui/HtmlContainer"; // 孪生（本批内一并转换）

// 孪生 any-shim：第三方 CJS 经 SystemJS 后具名/default 取命名空间
const React: any = (ReactModule as any).default;
const ReactDOM: any = (ReactDOMModule as any).default;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 挂 React 的 HTML 元素容器。 */
export class HtmlReactElement extends HtmlContainer {
  /**
   * 创建实例（new this(options, Component) 与孪生一致）。
   * @param options - 组件 props
   * @param Component - React 组件
   */
  static factory(options: any, Component: any): any {
    return new (this as any)(options, Component);
  }

  /** 组件 props。 */
  options: any;
  /** React 组件类/函数。 */
  Component: any;

  /**
   * @param options - 组件 props
   * @param Component - React 组件
   */
  constructor(options: any, Component: any) {
    super();
    this.options = options;
    this.Component = Component;
  }

  /** 惰性建 div 并首渲。 */
  render(): void {
    if (!this.isRendered()) {
      const el = document.createElement("div");
      this.setElement(el);
      this.renderReactElement();
    }
    super.render();
  }

  /** ReactDOM.render 到容器。 */
  renderReactElement(): void {
    ReactDOM.render(React.createElement(this.Component, this.options), this.getElement());
  }

  /**
   * 就地改 props 并刷新。
   * @param mutator - 就地修改 options 的回调
   */
  applyOptions(mutator: (options: any) => void): void {
    mutator(this.options);
    this.refresh();
  }

  /** 已渲染则重渲 React。 */
  refresh(): void {
    if (this.isRendered()) this.renderReactElement();
  }

  /** 卸载 React 并走父类 unrender。 */
  unrender(): void {
    const el = this.getElement();
    if (el && this.isRendered()) ReactDOM.unmountComponentAtNode(el);
    super.unrender();
  }
}
