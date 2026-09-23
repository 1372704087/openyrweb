/**
 * Resolution — 分辨率下拉（全屏禁用 + 适配窗口 + 预设列表）。
 *
 * 窗口 resize 时重算可用分辨率；当前分辨率不在列表时追加带缩放提示项。
 *
 * 由 gui/screen/options/component/Resolution.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React, { useEffect, useState } from "react"; // 孪生（react 外部依赖）
import { Select } from "gui/component/Select"; // 已转换
import { Option } from "gui/component/Option"; // 已转换

/** 预设分辨率（降序）。 */
const PRESETS = [
  { width: 1920, height: 1080 },
  { width: 1600, height: 900 },
  { width: 1280, height: 1024 },
  { width: 1366, height: 768 },
  { width: 1024, height: 768 },
  { width: 800, height: 600 },
];

/** 组件 props。 */
export interface ResolutionSelectProps {
  /** 当前分辨率 BoxedVar。 */
  resolution: any;
  /** 全屏管理。 */
  fullScreen: any;
  /** i18n 字典。 */
  strings: any;
}

/** 分辨率选择。 */
export const ResolutionSelect = ({
  resolution,
  fullScreen,
  strings: strings,
}: ResolutionSelectProps) => {
  const label = (r: any) => r.width + " x " + r.height;
  const windowSize = () => ({
    width: Math.max(PRESETS[PRESETS.length - 1].width, window.innerWidth),
    height: Math.max(PRESETS[PRESETS.length - 1].height, window.innerHeight),
  });
  const filterFit = (size: any) =>
    PRESETS.filter(
      (r, idx) =>
        (r.height <= size.height && r.width <= size.width) ||
        idx === PRESETS.length - 1,
    );
  const [win, setWin] = useState(() => windowSize());
  const [current, setCurrent] = useState(resolution.value);
  const [options, setOptions] = useState(() => filterFit(win));
  var isFull = fullScreen.isFullScreen();
  var orphan =
    current &&
    !options.find(
      (r) => r.height === current.height && r.width === current.width,
    );
  useEffect(() => {
    const onResize = () => {
      const size = windowSize();
      setWin(size);
      setOptions(filterFit(size));
    };
    window.addEventListener("resize", onResize);
    resolution.onChange.subscribe(setCurrent);
    return () => {
      window.removeEventListener("resize", onResize);
      resolution.onChange.unsubscribe(setCurrent);
    };
  }, []);
  return isFull
    ? React.createElement(
        Select,
        {
          className: "resolution-select",
          initialValue: "",
          disabled: true,
          onSelect: () => {},
        },
        React.createElement(Option, {
          value: "",
          label: strings.get("TS:ResolutionFullScreen", label(win)),
        }),
      )
    : React.createElement(
        Select,
        {
          className: "resolution-select",
          initialValue: current ? label(current) : "",
          onSelect: (value: string) => {
            var pair =
              "" !== value ? value.split(" x ").map((n) => Number(n)) : void 0;
            var res = pair ? { width: pair[0], height: pair[1] } : void 0;
            resolution.value = res;
          },
        },
        orphan &&
          React.createElement(Option, {
            value: label(current),
            label: `${label(current)} (${label({
              width: Math.min(current.width, win.width),
              height: Math.min(current.height, win.height),
            })})`,
          }),
        React.createElement(Option, {
          value: "",
          label: strings.get("TS:ResolutionFit", label(win)),
        }),
        options.map((r) => {
          const text = label(r);
          return React.createElement(Option, {
            key: text,
            value: text,
            label: text,
          });
        }),
      );
};
