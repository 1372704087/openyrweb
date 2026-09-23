/**
 * ErrorDetailsBoxApi — 详细错误信息弹窗 API（创建/显示/销毁 ErrorDetailsDialog）。
 *
 * 由 gui/component/ErrorDetailsBoxApi.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { HtmlReactElement } from "gui/HtmlReactElement"; // 孪生（本批内一并转换）
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { ErrorDetailsDialog } from "gui/component/ErrorDetailsDialog"; // 孪生（本批内一并转换）

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 详细错误弹窗 API。 */
export class ErrorDetailsBoxApi {
  /** 视口。 */
  viewport: any;
  /** i18n。 */
  strings: any;
  /** 挂载根。 */
  rootEl: any;
  /** 清理集合。 */
  disposables: CompositeDisposable;
  /** 当前对话框。 */
  component?: any;
  /** 关闭回调（可空）。 */
  private _onClosed: (() => void) | null = null;

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
   * 显示详细错误信息弹窗。
   * @param message - 主错误消息文本
   * @param details - 详细错误信息对象
   * @param details.type - 错误类型（如 "ChecksumError", "DownloadError"）
   * @param details.errorMessage - 原始错误消息
   * @param details.file - 受影响的文件名
   * @param details.stack - 堆栈跟踪
   * @param details.context - 附加上下文键值对
   * @param onClosed - 弹窗关闭后的回调
   */
  show(message: string, details?: any, onClosed?: () => void): void {
    const self = this;
    this.destroy();
    this._onClosed = onClosed || null;
    this.component = HtmlReactElement.factory(ErrorDetailsDialog, {
      message: message,
      details: details || null,
      viewport: this.viewport.value,
      strings: this.strings,
      onClose: function () {
        const cb = self._onClosed;
        self.destroy();
        if (cb) {
          self._onClosed = null;
          cb();
        }
      },
    });
    const handleResize = function (vp: any) {
      self.component.setSize(vp.width, vp.height);
      self.component.applyOptions(function (opts: any) {
        opts.viewport = vp;
      });
    };
    this.viewport.onChange.subscribe(handleResize);
    this.component.setSize(this.viewport.value.width, this.viewport.value.height);
    this.component.render();
    this.rootEl.appendChild(this.component.getElement());
    this.disposables.add(
      function () {
        self.viewport.onChange.unsubscribe(handleResize);
      },
      function () {
        if (self.component.getElement()) self.rootEl.removeChild(self.component.getElement());
      },
      function () {
        self.component.unrender();
      },
      function () {
        self.component = undefined;
      },
    );
  }

  /** 关闭并清理。 */
  destroy(): void {
    this.disposables.dispose();
  }
}
