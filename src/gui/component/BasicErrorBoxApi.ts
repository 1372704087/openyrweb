/**
 * BasicErrorBoxApi — 全屏基础错误对话框门面（Dialog + 多行 URL 链接）。
 *
 * show 弹出不可/可关的对话框并订阅 viewport 变化；destroy 解绑并摘 DOM。
 *
 * 由 gui/component/BasicErrorBoxApi.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { HtmlReactElement } from "gui/HtmlReactElement"; // 孪生（本批内一并转换）
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { Dialog } from "gui/component/Dialog"; // 孪生（本批内一并转换）
import { ReactFormat } from "gui/ReactFormat"; // 孪生（本批内一并转换）

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 基础错误框 API。 */
export class BasicErrorBoxApi {
  /** 视口 BoxedVar（含 onChange）。 */
  viewport: any;
  /** i18n。 */
  strings: any;
  /** 挂载根元素。 */
  rootEl: any;
  /** 一次性回调集合。 */
  disposables: CompositeDisposable;
  /** 当前对话框实例。 */
  component?: any;

  /**
   * @param viewport - 视口
   * @param strings - i18n
   * @param rootEl - 根 DOM
   */
  constructor(viewport: any, strings: any, rootEl: any) {
    this.viewport = viewport;
    this.strings = strings;
    this.rootEl = rootEl;
    this.disposables = new CompositeDisposable();
  }

  /**
   * 弹出错误对话框，resolve 于关闭（无按钮时不 resolve）。
   * @param message - 多行错误文本
   * @param hideClose - true 时不显示确定按钮
   */
  async show(message: string, hideClose = false): Promise<void> {
    return new Promise<void>((resolve) => {
      const comp = (this.component = HtmlReactElement.factory(Dialog, {
        children: ReactFormat.formatMultiline(message, (line) => ReactFormat.formatUrls(line)),
        className: "basic-error-box",
        viewport: this.viewport.value,
        buttons: hideClose
          ? []
          : [
              {
                label: this.strings.get("GUI:Ok"),
                onClick: () => {
                  this.destroy();
                  resolve();
                },
              },
            ],
      }));
      const onViewport = (vp: any) => {
        this.component.setSize(vp.width, vp.height);
        this.component.applyOptions((opts: any) => (opts.viewport = vp));
      };
      this.viewport.onChange.subscribe(onViewport);
      comp.setSize(this.viewport.value.width, this.viewport.value.height);
      comp.render();
      this.rootEl.appendChild(comp.getElement());
      this.disposables.add(
        () => this.viewport.onChange.unsubscribe(onViewport),
        () => this.component.getElement() && this.rootEl.removeChild(this.component.getElement()),
        () => this.component.unrender(),
        () => (this.component = undefined),
      );
    });
  }

  /** 关闭并清理当前对话框。 */
  destroy(): void {
    this.disposables.dispose();
  }
}
