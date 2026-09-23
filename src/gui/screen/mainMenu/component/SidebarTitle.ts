/**
 * SidebarTitle — 侧栏标题文本组件。
 *
 * 渲染 `div.sidebar-title`。
 *
 * 由 gui/screen/mainMenu/component/SidebarTitle.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React from "react"; // 孪生（react 外部依赖）

/** 组件 props。 */
export interface SidebarTitleProps {
  /** 标题文本。 */
  title: string;
}

/** 侧栏标题组件。 */
export const SidebarTitle = ({ title }: SidebarTitleProps) =>
  React.createElement("div", { className: "sidebar-title" }, title);
