/**
 * ToastApi — 右上角 Toast 推送（5 秒过期、最多 5 条、视口跟随）。
 *
 * push 后立即 update；无消息时 destroy；首条时经 JsxRenderer 挂 HtmlView(Toasts)。
 *
 * 由 gui/component/ToastApi.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { jsx } from "gui/jsx/jsx"; // 孪生（本批内一并转换）
import { HtmlView } from "gui/jsx/HtmlView"; // 孪生（本批内一并转换）
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { Toasts } from "gui/component/Toasts"; // 孪生（本批内一并转换）

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Toast 门面。 */
export class ToastApi {
  /** 视口。 */
  viewport: any;
  /** UI 场景。 */
  uiScene: any;
  /** JSX 渲染器。 */
  jsxRenderer: any;
  /** 当前消息。 */
  messages: { text: string; timestamp: number }[] = [];
  /** 清理集合。 */
  disposables: CompositeDisposable;
  /** 当前挂载的 toast UiObject。 */
  uiToasts?: any;
  /** 当前 HtmlView 内组件。 */
  innerComponent?: any;
  /** 下次刷新定时器。 */
  updateTimeoutId?: any;
  /** 视口变化处理器（ctor 赋值）。 */
  handleViewportChange: (vp: any) => void;

  /**
   * @param viewport - 视口
   * @param uiScene - UiScene
   * @param jsxRenderer - JsxRenderer
   */
  constructor(viewport: any, uiScene: any, jsxRenderer: any) {
    this.viewport = viewport;
    this.uiScene = uiScene;
    this.jsxRenderer = jsxRenderer;
    this.messages = [];
    this.disposables = new CompositeDisposable();
    this.handleViewportChange = (vp: any) => {
      if (this.innerComponent) this.innerComponent.applyOptions((opts: any) => (opts.viewport = vp));
    };
  }

  /**
   * 推入一条 toast 并立即刷新。
   * @param text - 文案
   */
  push(text: string): void {
    const timestamp = Date.now();
    this.messages.push({ text, timestamp });
    if (this.updateTimeoutId) {
      clearTimeout(this.updateTimeoutId);
      this.updateTimeoutId = undefined;
    }
    this.update();
  }

  /** 过期过滤 + 截断 5 条 + 首次挂载 / 更新 props。 */
  update(): void {
    this.messages = this.messages.filter((m) => m.timestamp > Date.now() - 5e3);
    this.messages = this.messages.slice(-5);
    if (this.messages.length) {
      const texts = this.messages.map((m) => m.text);
      if (this.uiToasts) {
        this.innerComponent?.applyOptions((opts: any) => (opts.messages = texts));
      } else {
        const [ui] = this.jsxRenderer.render(
          jsx(HtmlView, {
            innerRef: (el: any) => (this.innerComponent = el),
            component: Toasts,
            props: { messages: texts, viewport: this.viewport.value, zIndex: 101 },
          }),
        );
        this.uiToasts = ui;
        this.uiScene.add(ui);
        this.viewport.onChange.subscribe(this.handleViewportChange);
        this.disposables.add(
          ui,
          () => this.uiScene.remove(ui),
          () => this.viewport.onChange.unsubscribe(this.handleViewportChange),
          () => (this.innerComponent = undefined),
          () => (this.uiToasts = undefined),
        );
      }
      this.updateTimeoutId = setTimeout(() => this.update(), 5e3);
    } else {
      this.destroy();
    }
  }

  /** 清定时器并释放挂载。 */
  destroy(): void {
    if (this.updateTimeoutId) {
      clearTimeout(this.updateTimeoutId);
      this.updateTimeoutId = undefined;
    }
    this.disposables.dispose();
  }
}
