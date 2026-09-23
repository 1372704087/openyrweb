/**
 * Select — 自定义下拉（点外部关闭、hover 预选、cloneElement 注入选中态）。
 *
 * 由 gui/component/Select.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生（第三方）
import * as ClassnamesModule from "classnames"; // 孪生（第三方）
import { contains } from "util/dom"; // 已转换

// 孪生 any-shim：第三方 CJS 取 default
const React: any = (ReactModule as any).default;
const hooks: any = ReactModule as any;
const classnames: any = (ClassnamesModule as any).default ?? ClassnamesModule;

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 下拉选择。
 * @param props - {initialValue,disabled,tooltip,className,onSelect,labelStyle,children}
 */
export const Select = (props: any): any => {
  const { initialValue, disabled, tooltip, className, onSelect, labelStyle, children } = props;
  const [value, setValue] = hooks.useState(() => initialValue);
  const [hover, setHover] = hooks.useState(() => initialValue);
  const [open, setOpen] = hooks.useState(false);
  const rootRef = hooks.useRef(null);

  hooks.useEffect(() => {
    if (value !== initialValue) {
      setValue(initialValue);
      setHover(value);
    }
  }, [initialValue]);

  hooks.useEffect(() => {
    if (open) {
      setHover(value);
      const onDocClick = (ev: any) => {
        if (!contains(rootRef.current, ev.target)) setOpen(false);
      };
      document.addEventListener("click", onDocClick);
      return () => {
        document.removeEventListener("click", onDocClick);
      };
    }
  }, [open]);

  const current = value;
  const selectedChild = React.Children.toArray(children).find((c: any) => c.props.value === current);
  const selectedLabel = selectedChild ? selectedChild.props.label : "";

  return React.createElement(
    "div",
    { style: { display: "inline-block", verticalAlign: "middle" }, className },
    React.createElement(
      "div",
      { className: classnames("select", { disabled }), "data-r-tooltip": tooltip, ref: rootRef },
      React.createElement(
        "div",
        { className: "select-value", onClick: () => !disabled && setOpen(!open) },
        React.createElement("div", { style: labelStyle?.(value) }, selectedLabel),
      ),
      open &&
        React.createElement(
          "div",
          { className: "select-layer" },
          React.Children.map(children, (child: any) => {
            if (!child) return null;
            const childValue = child.props.value;
            const childDisabled = child.props.disabled;
            return React.createElement(
              "div",
              {
                onMouseEnter: () => {
                  if (!childDisabled) setHover(childValue);
                },
              },
              React.cloneElement(child, {
                selected: childValue === hover,
                labelStyle: labelStyle?.(childValue),
                onClick: () => {
                  setValue(childValue);
                  setHover(childValue);
                  onSelect?.(childValue);
                  setOpen(false);
                },
              }),
            );
          }),
        ),
    ),
  );
};
