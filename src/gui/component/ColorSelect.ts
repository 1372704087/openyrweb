/**
 * ColorSelect — 玩家颜色下拉（Select + Option 色块）。
 *
 * controlled color 同步；"random" 映射空串；disabled 时只列当前色。
 *
 * 由 gui/component/ColorSelect.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生（第三方）
import * as ClassnamesModule from "classnames"; // 孪生（第三方）
import { Select } from "gui/component/Select"; // 孪生（本批内一并转换）
import { Option } from "gui/component/Option"; // 孪生（本批内一并转换）

// 孪生 any-shim：第三方 CJS 取 default
const React: any = (ReactModule as any).default;
const hooks: any = ReactModule as any;
const classnames: any = (ClassnamesModule as any).default ?? ClassnamesModule;

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 颜色选择。
 * @param props - {color,disabled,availableColors,onSelect,strings}
 */
export const ColorSelect = (props: any): any => {
  const { color, disabled, availableColors, onSelect, strings } = props;
  const [localColor, setLocalColor] = hooks.useState(() => color);

  hooks.useEffect(() => {
    if (localColor !== color) setLocalColor(color);
  }, [color]);

  return React.createElement(
    Select,
    {
      className: classnames("player-color-select", { "bg-color": !!localColor }),
      tooltip: strings.get("STT:HostComboColor"),
      initialValue: localColor || "random",
      disabled,
      labelStyle: (value: string) => {
        return { backgroundColor: value !== "random" ? value : "transparent" };
      },
      onSelect: (value: string) => {
        let next = value;
        if (next === "random") next = "";
        setLocalColor(next);
        onSelect?.(next);
      },
    },
    (disabled ? [localColor] : availableColors).map((entry: any) =>
      React.createElement(Option, {
        key: entry,
        value: entry || "random",
        label: entry ? "" : strings.get("GUI:RandomAsSymbols"),
        className: classnames({ "bg-color": !!entry }),
      }),
    ),
  );
};
