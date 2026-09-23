/**
 * TeamSelect / formatTeamId — 队伍下拉（A/B/C… 字母标签，可选 NO_TEAM）。
 *
 * 由 gui/component/TeamSelect.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生（第三方）
import { Select } from "gui/component/Select"; // 孪生（本批内一并转换）
import { Option } from "gui/component/Option"; // 孪生（本批内一并转换）
import * as GameOptsConstantsModule from "game/gameopts/constants"; // 已转换

// 孪生 any-shim：第三方 CJS 取 default
const React: any = (ReactModule as any).default;
const NO_TEAM_ID: any = (GameOptsConstantsModule as any).NO_TEAM_ID;

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 队号 → 字母（0→A, 1→B, …）。
 * @param index - 0 基队号
 */
export function formatTeamId(index: number): string {
  return String.fromCharCode("A".charCodeAt(0) + index);
}

/**
 * 队伍选择。
 * @param props - {teamId,required,disabled,maxTeams,onSelect,strings}
 */
export const TeamSelect = (props: any): any => {
  const { teamId, required, disabled, maxTeams, onSelect, strings } = props;
  const indices = new Array(maxTeams).fill(0).map((_, i) => i);

  return React.createElement(
    Select,
    {
      className: "player-team-select",
      initialValue: "" + teamId,
      disabled,
      tooltip: strings.get("STT:HostComboTeam"),
      onSelect: (value: any) => {
        onSelect?.(Number(value));
      },
    },
    !required &&
      React.createElement(Option, { value: "" + NO_TEAM_ID, label: strings.get("GUI:NoneAsSymbols") }),
    indices.map((i) => React.createElement(Option, { key: i, value: "" + i, label: formatTeamId(i) })),
  );
};
