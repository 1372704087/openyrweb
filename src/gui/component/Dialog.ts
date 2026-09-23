/**
 * Dialog — 消息框对话框（内容 + 按钮行 + 视口定位）。
 *
 * hidden 时返回 null；wrapper 按 viewport 绝对定位；buttons 逐个渲染 dialog-button。
 *
 * 由 gui/component/Dialog.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生（第三方）

// 孪生 any-shim：第三方 CJS 取 default
const React: any = (ReactModule as any).default;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 对话框组件。 */
export class Dialog extends (React.Component as any) {
  /** 渲染（hidden 返回 null）。 */
  render(): any {
    if (this.props.hidden) return null;
    return React.createElement(
      "div",
      { style: this.getWrapperStyle() },
      React.createElement(
        "div",
        { className: "message-box " + (this.props.className || "") },
        React.createElement("div", { className: "message-box-content" }, this.props.children),
        React.createElement(
          "div",
          { className: "message-box-footer" },
          this.props.buttons.map((btn: any, i: number) => this.renderButton(btn, i)),
        ),
      ),
    );
  }

  /**
   * 渲染单个按钮。
   * @param button - {label,onClick,disabled}
   * @param key - 列表键
   */
  renderButton(button: any, key: number): any {
    return React.createElement(
      "button",
      { key, className: "dialog-button", onClick: button.onClick, disabled: button.disabled },
      button.label,
    );
  }

  /** 视口定位样式。 */
  getWrapperStyle(): any {
    const vp = this.props.viewport;
    return {
      position: "absolute",
      top: vp.x,
      left: vp.y,
      width: vp.width,
      height: vp.height,
      zIndex: this.props.zIndex,
    };
  }
}
