/**
 * ReactFormat — 多行拆分与 URL/Markdown 链接 React 化。
 *
 * formatMultiline：按 \n 拆行，第二行起前插 <br/>；
 * formatUrls：匹配裸 URL 与 [text](url)，渲染为 target=_blank 的 <a>。
 *
 * 由 gui/ReactFormat.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生（第三方）

// 孪生 any-shim：第三方 CJS 经 SystemJS 后取 default
const React: any = (ReactModule as any).default;

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 匹配 [text](url) 或裸 URL/mailto。 */
const URL_SPLIT_RE = /(\[(?:[^\]]+)\]\((?:https?:\/\/[^\s]+|mailto:[^\s]+)\))|(https?:\/\/[^\s]+|mailto:[^\s]+)/g;
/** 整段 Markdown 链接。 */
const MARKDOWN_LINK_RE = /^\[([^\]]+)\]\((https?:\/\/[^\s]+|mailto:[^\s]+)\)$/;

/** React 文本格式化工具。 */
export class ReactFormat {
  /**
   * 多行文本：每行用 formatter 转节点，非首行前插 <br/>。
   * @param text - 多行原文
   * @param formatter - 行格式化
   */
  static formatMultiline(text: string, formatter: (line: string) => any): any[] {
    return text.split(/\n/g).map((line, i) =>
      i
        ? React.createElement(React.Fragment, { key: i }, React.createElement("br", null), formatter(line))
        : line,
    );
  }

  /**
   * 从纯文本提取 URL 并渲染为链接。
   * @param text - 原文
   */
  static formatUrls(text: string): any {
    return React.createElement(
      React.Fragment,
      null,
      text
        .split(URL_SPLIT_RE)
        .filter(Boolean)
        .map((part, i) => {
          if (!URL_SPLIT_RE.test(part)) return part;
          let label: string;
          let href: string;
          const md = part.match(MARKDOWN_LINK_RE);
          if (md) {
            label = md[1];
            href = md[2];
          } else {
            label = part;
            href = part;
          }
          return React.createElement(
            "a",
            { key: i, href, rel: "noopener noreferrer", target: "_blank" },
            label,
          );
        }),
    );
  }
}
