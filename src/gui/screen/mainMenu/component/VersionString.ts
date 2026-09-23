/**
 * VersionString — 侧栏版本号展示组件。
 *
 * 渲染 `div.menu-version-string`，内容为 "v" + value。
 *
 * 由 gui/screen/mainMenu/component/VersionString.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React from "react"; // 孪生（react 外部依赖）

/** 组件 props：版本字符串。 */
export interface VersionStringProps {
  /** 版本号文本（不含 v 前缀）。 */
  value: string;
}

/** 版本号字符串组件。 */
export const VersionString = ({ value }: VersionStringProps) =>
  React.createElement("div", { className: "menu-version-string" }, "v", value);
