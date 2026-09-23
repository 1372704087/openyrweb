/**
 * Option — 下拉/列表选项项（selected/disabled 样式）。
 *
 * 由 gui/component/Option.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ClassnamesModule from "classnames"; // 孪生（第三方）
import * as ReactModule from "react"; // 孪生（第三方）

// 孪生 any-shim：第三方 CJS 取 default
const React: any = ReactModule as any;
const createElement: any = (ReactModule as any).createElement ?? ReactModule.createElement;
const classnames: any = (ClassnamesModule as any).default ?? ClassnamesModule;

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 选项项。
 * @param props - {selected,disabled,label,style,labelStyle,className,tooltip,onClick}
 */
export const Option = (props: any): any => {
  const { selected, disabled, label, style, labelStyle, className, tooltip, onClick } = props;
  return createElement(
    "div",
    {
      className: classnames("option", { selected, disabled }, className),
      style,
      onClick: disabled ? undefined : onClick,
      "data-r-tooltip": tooltip,
    },
    createElement("div", { style: labelStyle }, label),
  );
};
