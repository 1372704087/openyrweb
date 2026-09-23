/**
 * Slider — range + 只读文本回显（受控 value 同步）。
 *
 * 由 gui/component/Slider.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生（第三方）

// 孪生 any-shim：第三方 CJS 取 default / hooks
const React: any = (ReactModule as any).default;
const hooks: any = ReactModule as any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 滑条。
 * @param props - {getLabel,...inputProps,value,onChange}
 */
export const Slider = (props: any): any => {
  const { getLabel, ...rest } = props;
  const [localValue, setLocalValue] = hooks.useState(() => rest.value);

  hooks.useEffect(() => {
    if (localValue !== rest.value) setLocalValue(rest.value);
  }, [rest.value]);

  return React.createElement(
    "div",
    { style: { display: "inline-block", verticalAlign: "middle" } },
    React.createElement("input", {
      type: "range",
      ...rest,
      value: localValue,
      onChange: (ev: any) => {
        setLocalValue(ev.target.value);
        rest.onChange?.(ev);
      },
    }),
    React.createElement("input", {
      type: "text",
      disabled: true,
      readOnly: true,
      value: getLabel?.(localValue) ?? localValue,
    }),
  );
};
