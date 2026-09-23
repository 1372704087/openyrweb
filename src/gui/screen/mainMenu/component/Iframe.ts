/**
 * Iframe — 通用 iframe 包装组件。
 *
 * 仅透传 src 与 className。
 *
 * 由 gui/screen/mainMenu/component/Iframe.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React from "react"; // 孪生（react 外部依赖）

/** 组件 props。 */
export interface IframeProps {
  /** 嵌入地址。 */
  src: string;
  /** 样式类名。 */
  className?: string;
}

/** iframe 包装。 */
export const Iframe = ({ src, className }: IframeProps) =>
  React.createElement("iframe", { src, className });
