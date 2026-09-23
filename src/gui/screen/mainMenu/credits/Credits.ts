/**
 * Credits — 制作人员内容模板渲染组件。
 *
 * `{Key}` → i18n；`<https://...>` → 外链 a；制表符分隔行 →
 * title/filler/name 三栏 div；换行 → `<br />`。
 *
 * 由 gui/screen/mainMenu/credits/Credits.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React from "react"; // 孪生（react 外部依赖）

/** 组件 props。 */
export interface CreditsProps {
  /** 内容模板。 */
  contentTpl: string;
  /** i18n 字典。 */
  strings: any;
}

/** 制作人员滚动内容。 */
export const Credits = ({ contentTpl, strings: strings }: CreditsProps) => {
  var html = contentTpl
    .replace(/\{([^}]+)\}/g, (_m, key) => strings.get(key))
    .replace(/<([^>]+)>/g, (_m, url) =>
      url.match(/^(https?|mailto):(\/\/)?/)
        ? `<a href='${encodeURI(url)}' target='_blank' rel='noopener'>${encodeURI(url)}</a>`
        : "",
    )
    .replace(/\t*\r?\n/g, "<br />")
    .replace(
      /([^>]+)\t+([^<]+)<br \/>/g,
      `<div class='def'>
                <span class='title'>$1</span>
                <span class='filler'></span>
                <span class='name'>$2</span>
            </div>`,
    );
  return React.createElement(
    "div",
    { className: "credits-container" },
    React.createElement("div", {
      className: "credits",
      dangerouslySetInnerHTML: { __html: html },
    }),
  );
};
