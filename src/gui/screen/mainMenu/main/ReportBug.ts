/**
 * ReportBug — 报告 Bug 说明块（描述 + Discord 外链）。
 *
 * 由 gui/screen/mainMenu/main/ReportBug.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React from "react"; // 孪生（react 外部依赖）

/** 组件 props。 */
export interface ReportBugProps {
  /** i18n 字典。 */
  strings: any;
  /** Discord 反馈链接。 */
  discordUrl: string;
}

/** 报告 Bug 区块。 */
export const ReportBug = ({ strings: strings, discordUrl }: ReportBugProps) =>
  React.createElement(
    "div",
    null,
    strings.get("TS:ReportBugDesc"),
    React.createElement("br", null),
    React.createElement("br", null),
    React.createElement("a", { target: "_blank", href: discordUrl }, discordUrl),
  );
