/**
 * CountrySelect — 国家选择（图标预览 + Select 列表）。
 *
 * controlled country 同步；onlyIcon 隐藏下拉；disabled 只列当前项；
 * label/tooltip 走 countryUiNames / countryUiTooltips。
 *
 * 由 gui/component/CountrySelect.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生（第三方）
import { CountryIcon } from "gui/component/CountryIcon"; // 孪生（本批内一并转换）
import { Select } from "gui/component/Select"; // 孪生（本批内一并转换）
import { Option } from "gui/component/Option"; // 孪生（本批内一并转换）

// 孪生 any-shim：第三方 CJS 取 default
const React: any = (ReactModule as any).default;
const hooks: any = ReactModule as any;

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 国家选择。
 * @param props - {country,availableCountries,onlyIcon,disabled,strings,countryUiNames,countryUiTooltips,onSelect}
 */
export const CountrySelect = (props: any): any => {
  const {
    country,
    availableCountries,
    onlyIcon,
    disabled,
    strings,
    countryUiNames,
    countryUiTooltips,
    onSelect,
  } = props;
  const [localCountry, setLocalCountry] = hooks.useState(() => country);

  hooks.useEffect(() => {
    if (localCountry !== country) setLocalCountry(country);
  }, [country]);

  return React.createElement(
    "div",
    { className: "country-select" },
    React.createElement(
      "div",
      { className: "player-country-icon", "data-r-tooltip": strings.get("STT:HostPictureFlag") },
      React.createElement(CountryIcon, { country: localCountry }),
    ),
    onlyIcon
      ? null
      : React.createElement(
          Select,
          {
            className: "player-country-select",
            tooltip: strings.get("STT:HostComboCountry"),
            initialValue: localCountry,
            disabled,
            onSelect: (value: any) => {
              setLocalCountry(value);
              onSelect(value);
            },
          },
          (disabled ? [localCountry] : availableCountries).map((entry: any) => {
            const label = strings.get(countryUiNames.get(entry) || entry);
            const tooltip = countryUiTooltips.has(entry) ? strings.get(countryUiTooltips.get(entry)) : undefined;
            return React.createElement(Option, { key: entry, value: entry, label, tooltip });
          }),
        ),
  );
};
