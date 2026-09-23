/**
 * PrefetchProgress — CDN 资源预取进度条组件。
 *
 * 渲染 label + progress(value, max=100)。
 *
 * 由 gui/screen/mainMenu/component/PrefetchProgress.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React from "react"; // 孪生（react 外部依赖）

/** 组件 props。 */
export interface PrefetchProgressProps {
  /** 进度百分比 0–100。 */
  progress: number;
  /** 状态文案。 */
  statusText: string;
}

/** 预取进度组件。 */
export const PrefetchProgress = ({
  progress,
  statusText,
}: PrefetchProgressProps) =>
  React.createElement(
    "div",
    { className: "prefetch-progress" },
    React.createElement(
      "div",
      null,
      React.createElement("label", null, statusText),
      React.createElement("progress", { value: progress, max: 100 }),
    ),
  );
