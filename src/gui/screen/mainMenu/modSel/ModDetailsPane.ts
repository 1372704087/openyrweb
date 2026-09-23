/**
 * ModDetailsPane — 模组详情表（名称/状态/版本/描述/作者/网站）。
 *
 * 状态文案 Map：Installed/UpdateAvailable/NotInstalled；
 * loaded 与 unsupported 以逗号拼接进状态格。
 *
 * 由 gui/screen/mainMenu/modSel/ModDetailsPane.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React from "react"; // 孪生（react 外部依赖）
import { ModStatus } from "gui/screen/mainMenu/modSel/ModStatus"; // 孪生（本组内一并转换）

/** 状态 → i18n key。 */
const STATUS_LABELS = new Map<ModStatus, string>([
  [ModStatus.Installed, "GUI:ModStatusInstalled"],
  [ModStatus.UpdateAvailable, "GUI:ModStatusUpdateAvail"],
  [ModStatus.NotInstalled, "GUI:ModStatusNotInstalled"],
]);

/** 组件 props。 */
export interface ModDetailsPaneProps {
  /** 模组详情字段。 */
  modDetails: {
    supported?: boolean;
    name?: string;
    description?: string;
    authors?: string[];
    version?: string;
    website?: string;
  };
  /** 当前是否已加载该模组。 */
  modLoaded?: boolean;
  /** 状态枚举。 */
  modStatus: ModStatus;
  /** i18n 字典。 */
  strings: any;
}

/** 模组详情侧栏。 */
export const ModDetailsPane = ({
  modDetails: {
    supported,
    name,
    description,
    authors,
    version,
    website,
  },
  modLoaded,
  modStatus,
  strings: strings,
}: ModDetailsPaneProps) =>
  React.createElement(
    "div",
    { className: "mod-details" },
    React.createElement(
      "table",
      null,
      React.createElement(
        "tbody",
        null,
        React.createElement(
          "tr",
          null,
          React.createElement("td", null, strings.get("GUI:ModName"), ":"),
          React.createElement("td", null, name),
        ),
        React.createElement(
          "tr",
          null,
          React.createElement("td", null, strings.get("GUI:ModStatus"), ":"),
          React.createElement(
            "td",
            null,
            strings.get(STATUS_LABELS.get(modStatus) ?? "GUI:Unknown"),
            modLoaded ? ", " + strings.get("GUI:ModLoaded") : "",
            supported ? "" : ", " + strings.get("GUI:ModUnsupported"),
          ),
        ),
        version &&
          React.createElement(
            "tr",
            null,
            React.createElement("td", null, strings.get("GUI:ModVersion"), ":"),
            React.createElement("td", null, version),
          ),
        description &&
          React.createElement(
            "tr",
            null,
            React.createElement("td", null, strings.get("GUI:ModDescription"), ":"),
            React.createElement("td", { className: "mod-desc" }, description),
          ),
        authors &&
          React.createElement(
            "tr",
            null,
            React.createElement("td", null, strings.get("GUI:ModAuthor"), ":"),
            React.createElement("td", null, authors.join(", ")),
          ),
        website &&
          React.createElement(
            "tr",
            null,
            React.createElement("td", null, strings.get("GUI:ModWebsite"), ":"),
            React.createElement(
              "td",
              null,
              React.createElement(
                "a",
                { href: website, rel: "nofollow noopener", target: "_blank" },
                website,
              ),
            ),
          ),
      ),
    ),
  );
