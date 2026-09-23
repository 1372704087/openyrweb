/**
 * Toasts — 多行 toast 容器（绝对定位叠放）。
 *
 * 由 gui/component/Toasts.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生（第三方）

// 孪生 any-shim：第三方 CJS 取 default
const React: any = (ReactModule as any).default;

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Toast 列表。
 * @param props - {messages,viewport,zIndex}
 */
export const Toasts = (props: any): any => {
  const { messages, viewport, zIndex } = props;
  return React.createElement(
    "div",
    { style: { position: "absolute", top: viewport.x, left: viewport.y, width: viewport.width, zIndex } },
    React.createElement(
      "div",
      { className: "toasts" },
      messages.map((text: string, i: number) => React.createElement("div", { key: i, className: "toast" }, text)),
    ),
  );
};
