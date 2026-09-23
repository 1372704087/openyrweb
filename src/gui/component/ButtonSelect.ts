/**
 * ButtonSelect — 按钮组单选（hover 预选 + 受控 initialValue 同步）。
 *
 * children 需带 value/disabled props；点击后 onSelect；disabled 整组锁死。
 *
 * 由 gui/component/ButtonSelect.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生（第三方）
import * as ClassnamesModule from "classnames"; // 孪生（第三方）

// 孪生 any-shim：第三方 CJS 取 default / 命名空间
const React: any = (ReactModule as any).default;
const hooks: any = ReactModule as any;
const classnames: any = (ClassnamesModule as any).default ?? ClassnamesModule;

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 按钮组单选。
 * @param props - initialValue/disabled/tooltip/className/onSelect/labelStyle/children
 */
export const ButtonSelect = (props: any): any => {
  const { initialValue, disabled, tooltip, className, onSelect, labelStyle, children } = props;
  const [selected, setSelected] = hooks.useState(() => initialValue);
  const [hovered, setHovered] = hooks.useState(() => initialValue);
  const rootRef = hooks.useRef(null);

  hooks.useEffect(() => {
    if (selected !== initialValue) {
      setSelected(initialValue);
      setHovered(initialValue);
    }
  }, [initialValue]);

  hooks.useEffect(() => {
    setHovered(selected);
  }, []);

  return React.createElement(
    "div",
    { className: classnames("button-select", { disabled }, className), "data-r-tooltip": tooltip, ref: rootRef },
    React.Children.map(children, (child: any) => {
      if (!child) return null;
      const value = child.props.value;
      const childDisabled = child.props.disabled;
      return React.createElement(
        "div",
        {
          onMouseEnter: () => {
            if (!childDisabled) setHovered(value);
          },
          onMouseLeave: () => {
            if (hovered === value) setHovered(undefined);
          },
        },
        React.cloneElement(child, {
          selected: value === selected || value === hovered,
          disabled: childDisabled || disabled,
          labelStyle: labelStyle?.(value),
          onClick: () => {
            setSelected(value);
            setHovered(value);
            onSelect(value);
          },
        }),
      );
    }),
  );
};
