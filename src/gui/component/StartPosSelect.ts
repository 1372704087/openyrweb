/**
 * StartPosSelect — 出生点下拉（含 RANDOM_START_POS 符号标签）。
 *
 * 由 gui/component/StartPosSelect.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生（第三方）
import { Select } from "gui/component/Select"; // 孪生（本批内一并转换）
import * as GameOptsConstantsModule from "game/gameopts/constants"; // 已转换
import { Option } from "gui/component/Option"; // 孪生（本批内一并转换）

// 孪生 any-shim：第三方 CJS 取 default
const React: any = (ReactModule as any).default;
const RANDOM_START_POS: any = (GameOptsConstantsModule as any).RANDOM_START_POS;

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 出生点选择。
 * @param props - {startPos,disabled,availableStartPositions,onSelect,strings}
 */
export const StartPosSelect = (props: any): any => {
  const { startPos, disabled, availableStartPositions, onSelect, strings } = props;
  const options = [...new Set([startPos, ...availableStartPositions]).values()].sort();

  return React.createElement(
    Select,
    {
      className: "player-start-pos-select",
      initialValue: "" + startPos,
      disabled,
      tooltip: strings.get("STT:HostComboStart"),
      onSelect: (value: any) => {
        onSelect?.(Number(value));
      },
    },
    options.map((pos: any) =>
      React.createElement(Option, {
        key: pos,
        value: "" + pos,
        label: pos === RANDOM_START_POS ? strings.get("GUI:RandomAsSymbols") : "" + (pos + 1),
      }),
    ),
  );
};
