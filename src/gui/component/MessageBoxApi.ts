/**
 * MessageBoxApi — 消息/确认/输入对话框门面（HtmlView + Dialog / PromptDialog）。
 *
 * show/alert/confirm/prompt；updateViewport/updateText 热更；destroy 解绑。
 *
 * 由 gui/component/MessageBoxApi.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生（第三方）
import { jsx } from "gui/jsx/jsx"; // 孪生（本批内一并转换）
import { HtmlView } from "gui/jsx/HtmlView"; // 孪生（本批内一并转换）
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { Dialog } from "gui/component/Dialog"; // 孪生（本批内一并转换）
import { PromptDialog } from "gui/component/PromptDialog"; // 孪生（本批内一并转换）

// 孪生 any-shim：第三方 CJS 取 default / createElement
const ReactModuleNs: any = ReactModule as any;
const React: any = ReactModuleNs.default;
const createElement: any = ReactModuleNs.createElement ?? ReactModule?.createElement;
const Fragment: any = ReactModuleNs.Fragment ?? React?.Fragment;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 消息框 API。 */
export class MessageBoxApi {
  /** 视口。 */
  viewport: any;
  /** UI 场景。 */
  uiScene: any;
  /** JSX 渲染器。 */
  jsxRenderer: any;
  /** 清理集合。 */
  disposables: CompositeDisposable;
  /** 当前 HtmlView 内组件。 */
  component?: any;

  /**
   * @param viewport - 视口
   * @param uiScene - UiScene
   * @param jsxRenderer - JsxRenderer
   */
  constructor(viewport: any, uiScene: any, jsxRenderer: any) {
    this.viewport = viewport;
    this.uiScene = uiScene;
    this.jsxRenderer = jsxRenderer;
    this.disposables = new CompositeDisposable();
  }

  /**
   * 显示消息框。
   * @param children - 文本或节点
   * @param buttonsOrOk - 字符串（单 OK）或按钮数组
   * @param onOk - 字符串时的关闭回调；或 {className} 选项对象（非函数时作为 options）
   */
  show(children: any, buttonsOrOk?: any, onOk?: any): void {
    this.destroy();
    // 孪生：options 取第 3 参（非函数时），buttons 取第 2 参
    const options = typeof onOk !== "function" ? onOk : undefined;
    const [ui] = this.jsxRenderer.render(
      jsx(HtmlView, {
        innerRef: (el: any) => (this.component = el),
        component: Dialog,
        props: {
          children: typeof children !== "string" ? children : this.splitNewLines(children),
          className: options?.className,
          viewport: this.viewport,
          zIndex: 101,
          buttons:
            typeof buttonsOrOk === "string"
              ? [
                  {
                    label: buttonsOrOk,
                    onClick: () => {
                      this.disposables.dispose();
                      if (typeof onOk === "function") onOk();
                    },
                  },
                ]
              : (buttonsOrOk ?? []).map((btn: any) => ({
                  label: btn.label,
                  disabled: btn.disabled,
                  onClick: () => {
                    this.disposables.dispose();
                    btn.onClick?.();
                  },
                })),
        },
      }),
    );
    this.uiScene.add(ui);
    this.disposables.add(ui, () => this.uiScene.remove(ui), () => (this.component = undefined));
  }

  /**
   * 多行文本 → span/br 节点。
   * @param text - 多行文本
   */
  splitNewLines(text: string): any[] {
    return text.split(/\n/g).map((line, i) =>
      i
        ? createElement(
            Fragment,
            { key: i },
            createElement("br", null),
            createElement("span", null, line),
          )
        : createElement("span", { key: i }, line),
    );
  }

  /**
   * 确认框。
   * @param message - 文本
   * @param yesLabel - 确认按钮
   * @param noLabel - 取消按钮
   */
  async confirm(message: any, yesLabel: string, noLabel: string): Promise<boolean> {
    return await new Promise((resolve) => {
      this.show(message, [
        { label: yesLabel, onClick: () => resolve(true) },
        { label: noLabel, onClick: () => resolve(false) },
      ]);
    });
  }

  /**
   * 警告/信息框。
   * @param message - 文本
   * @param okLabel - 按钮文案
   */
  async alert(message: any, okLabel?: string): Promise<void> {
    await new Promise((resolve) => this.show(message, okLabel, resolve));
  }

  /**
   * 输入框。
   * @param promptText - 提示
   * @param submitLabel - 提交按钮
   * @param cancelLabel - 取消按钮
   * @param inputProps - 额外 input props
   */
  async prompt(promptText: string, submitLabel: string, cancelLabel: string, inputProps?: any): Promise<any> {
    this.destroy();
    return await new Promise((resolve) => {
      const [ui] = this.jsxRenderer.render(
        jsx(HtmlView, {
          innerRef: (el: any) => (this.component = el),
          component: PromptDialog,
          props: {
            promptText,
            submitLabel,
            cancelLabel,
            inputProps,
            onSubmit: (value: any) => {
              resolve(value);
              ui.destroy();
            },
            onDismiss: () => {
              resolve(undefined);
              ui.destroy();
            },
            viewport: this.uiScene.viewport,
          },
        }),
      );
      this.uiScene.add(ui);
      this.disposables.add(ui, () => this.uiScene.remove(ui), () => (this.component = undefined));
    });
  }

  /**
   * 热更视口。
   * @param viewport - 新视口
   */
  updateViewport(viewport: any): void {
    this.viewport = viewport;
    if (this.component) this.component.applyOptions((opts: any) => (opts.viewport = viewport));
  }

  /**
   * 热更文案。
   * @param text - 新文本
   */
  updateText(text: any): void {
    if (this.component) {
      this.component.applyOptions((opts: any) => {
        if (opts.promptText) opts.promptText = text;
        else opts.children = typeof text !== "string" ? text : this.splitNewLines(text);
      });
    }
  }

  /** 释放当前框。 */
  destroy(): void {
    this.disposables.dispose();
  }
}
