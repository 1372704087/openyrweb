/**
 * RankIndicator — 军衔图标 + 悬浮军衔名。
 *
 * 导出 RANK_LABELS；无档案时 tooltip undefined；None 不显示图标。
 *
 * 由 gui/screen/mainMenu/lobby/component/RankIndicator.ts.js
 * 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React from "react"; // 孪生（react 外部依赖）
import { Image } from "gui/component/Image"; // 已转换
import { PlayerRankType } from "network/ladder/PlayerRankType"; // 已转换

/** 军衔 → 图标基名。 */
const ICON_BY_RANK = new Map<any, string>()
  .set(PlayerRankType.Private, "private")
  .set(PlayerRankType.Corporal, "corporal")
  .set(PlayerRankType.Sergeant, "sergeant")
  .set(PlayerRankType.Lieutenant, "lieutena")
  .set(PlayerRankType.Major, "major")
  .set(PlayerRankType.Colonel, "colonel")
  .set(PlayerRankType.BrigGeneral, "briggenr")
  .set(PlayerRankType.General, "general")
  .set(PlayerRankType.FiveStarGeneral, "stargen")
  .set(PlayerRankType.CommanderInChief, "comchief");

/** 军衔 → i18n key（导出与孪生一致）。 */
export const RANK_LABELS = new Map<any, string>()
  .set(PlayerRankType.Private, "GUI:RankPrivate")
  .set(PlayerRankType.Corporal, "GUI:RankCorporal")
  .set(PlayerRankType.Sergeant, "GUI:RankSergeant")
  .set(PlayerRankType.Lieutenant, "GUI:RankLieutenant")
  .set(PlayerRankType.Major, "GUI:RankMajor")
  .set(PlayerRankType.Colonel, "GUI:RankColonel")
  .set(PlayerRankType.BrigGeneral, "GUI:RankBrigGeneral")
  .set(PlayerRankType.General, "GUI:RankGeneral")
  .set(PlayerRankType.FiveStarGeneral, "GUI:RankFiveStar")
  .set(PlayerRankType.CommanderInChief, "GUI:RankCmdInChief");

/** 组件 props。 */
export interface RankIndicatorProps {
  /** 玩家档案（可空）。 */
  playerProfile?: any;
  /** i18n 字典。 */
  strings: any;
}

/** 军衔指示。 */
export const RankIndicator = ({
  playerProfile,
  strings: strings,
}: RankIndicatorProps) => {
  var rank = playerProfile?.rankType ?? PlayerRankType.None;
  var tooltip = playerProfile
    ? rank !== PlayerRankType.None
      ? playerProfile.name + " : " + strings.get(RANK_LABELS.get(rank))
      : playerProfile.name + " : " + strings.get("TXT_UNRANKED")
    : void 0;
  return React.createElement(
    "div",
    { className: "rank-indicator", "data-r-tooltip": tooltip },
    rank !== PlayerRankType.None
      ? React.createElement(Image, { src: ICON_BY_RANK.get(rank) + ".pcx" })
      : null,
  );
};
