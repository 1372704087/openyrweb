/**
 * List / ListItem / ListHeader — 通用列表三件套。
 *
 * 由 gui/component/List.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生（第三方）
import * as ClassnamesModule from "classnames"; // 孪生（第三方）

// 孪生 any-shim：第三方 CJS 取 default
const React: any = (ReactModule as any).default;
const classnames: any = (ClassnamesModule as any).default ?? ClassnamesModule;

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 列表容器（可选标题）。
 * @param props - {children,className,title,innerRef,tooltip}
 */
export const List = (props: any): any => {
  const { children, className, title, innerRef, tooltip } = props;
  return React.createElement(
    React.Fragment,
    null,
    title && React.createElement("div", { className: "list-title" }, title),
    React.createElement(
      "div",
      { ref: innerRef, className: classnames("list", className), "data-r-tooltip": tooltip },
      children,
    ),
  );
};

/**
 * 列表项。
 * @param props - {children,selected,disabled,tooltip,className,innerRef,...rest}
 */
export const ListItem = (props: any): any => {
  const { children, selected, disabled, tooltip, className, innerRef, ...rest } = props;
  return React.createElement(
    "div",
    {
      ref: innerRef,
      className: classnames("list-item", { selected, disabled }, className),
      "data-r-tooltip": tooltip,
      ...rest,
    },
    children,
  );
};

/**
 * 列表头。
 * @param props - {children,tooltip,className,innerRef,...rest}
 */
export const ListHeader = (props: any): any => {
  const { children, tooltip, className, innerRef, ...rest } = props;
  return React.createElement(
    "div",
    { ref: innerRef, className: classnames("list-header", className), "data-r-tooltip": tooltip, ...rest },
    children,
  );
};
