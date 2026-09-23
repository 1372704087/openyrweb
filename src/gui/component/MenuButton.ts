/**
 * MenuButton — 绝对定位菜单按钮（disabled 时忽略鼠标事件）。
 *
 * 由 gui/component/MenuButton.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生（第三方）

// 孪生 any-shim：第三方 CJS 取 default
const React: any = (ReactModule as any).default;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 菜单按钮。 */
export class MenuButton extends (React.Component as any) {
  /** 渲染（无 buttonConfig 返回 null）。 */
  render(): any {
    const config = this.props["buttonConfig"];
    if (!config) return null;
    return React.createElement(
      "div",
      {
        className: this.getClassName(config),
        style: this.getStyle(),
        onMouseDown: (ev: any) => this.onMouseDown(ev),
        onMouseUp: (ev: any) => this.onMouseUp(ev),
        onClick: (ev: any) => this.onClick(ev),
        "data-r-tooltip": config.tooltip,
      },
      config.label,
    );
  }

  /**
   * 拼 class。
   * @param config - 按钮配置
   */
  getClassName(config: any): string {
    const parts = ["menu-button"];
    if (config.disabled) parts.push("disabled");
    return parts.join(" ");
  }

  /** 按 box 定位样式。 */
  getStyle(): any {
    const box = this.props.box;
    return {
      position: "absolute",
      left: box.x,
      top: box.y,
      width: box.width,
      height: box.height,
      lineHeight: box.height + 1 + "px",
    };
  }

  /**
   * mousedown（非 disabled 且有回调时）。
   * @param ev - 事件
   */
  onMouseDown(ev: any): void {
    if (!this.props.buttonConfig.disabled && this.props.onMouseDown) this.props.onMouseDown(ev);
  }

  /**
   * mouseup（非 disabled 且有回调时）。
   * @param ev - 事件
   */
  onMouseUp(ev: any): void {
    if (!this.props.buttonConfig.disabled && this.props.onMouseUp) this.props.onMouseUp(ev);
  }

  /**
   * click（非 disabled 且有回调时）。
   * @param ev - 事件
   */
  onClick(ev: any): void {
    if (!this.props.buttonConfig.disabled && this.props.onClick) this.props.onClick(ev);
  }
}
