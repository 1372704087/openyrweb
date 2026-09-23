/**
 * ModDownloadPrompt — 手动下载模组提示（外链 + 体积）。
 *
 * 由 gui/screen/mainMenu/modSel/ModDownloadPrompt.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React from "react"; // 孪生（react 外部依赖）

/** 组件 props。 */
export interface ModDownloadPromptProps {
  /** 下载 URL。 */
  url?: string;
  /** 体积 MB。 */
  sizeMb: number;
  /** 是否更新提示。 */
  isUpdate?: boolean;
  /** i18n 字典。 */
  strings: any;
  /** 点击外链。 */
  onClick?: (e: any) => void;
}

/** 手动下载模组提示。 */
export const ModDownloadPrompt = ({
  url,
  sizeMb,
  isUpdate,
  strings: strings,
  onClick,
}: ModDownloadPromptProps) =>
  React.createElement(
    "div",
    null,
    isUpdate &&
      React.createElement(
        "p",
        { style: { marginTop: 0 } },
        strings.get("GUI:ModUpdateAvail"),
      ),
    React.createElement("p", null, strings.get("GUI:ManualDownloadModPrompt")),
    React.createElement(
      "a",
      { href: url, rel: "nofollow noopener", target: "_blank", onClick },
      url,
    ),
    React.createElement("br", null),
    React.createElement("br", null),
    React.createElement(
      "em",
      null,
      strings.get("ts:gameres_download_size", sizeMb),
    ),
  );
