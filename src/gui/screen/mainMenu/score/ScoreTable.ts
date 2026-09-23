/**
 * ScoreTable — 对局结算表（胜负头 + 玩家统计行）。
 *
 * 本地 resultType 缺省时按平局/败/胜推断；tournament+战报显示 MMR。
 *
 * 由 gui/screen/mainMenu/score/ScoreTable.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import classNames from "classnames"; // 孪生（classnames 外部依赖）
import { aiUiNames } from "game/gameopts/constants"; // 已转换
import { CountryIcon } from "gui/component/CountryIcon"; // 已转换
import React from "react"; // 孪生（react 外部依赖）
import { formatTimeDuration } from "util/format"; // 已转换
import { RankIndicator } from "gui/screen/mainMenu/lobby/component/RankIndicator"; // 孪生（本组内一并转换）
import { WolGameReportResult } from "network/WolGameReport"; // 已转换

/** 分值增减 span。 */
const PointsGain = ({
  value,
  win,
  className,
}: {
  value: number;
  win?: boolean;
  className?: string;
}) => {
  let sign: string;
  sign = 0 < value ? "+" : 0 === value ? (win ? "+" : "-") : "";
  return React.createElement(
    "span",
    { className: classNames(className, { positive: win }) },
    sign,
    value,
  );
};

/** 组件 props。 */
export interface ScoreTableProps {
  /** 对局对象。 */
  game: any;
  /** 是否单人。 */
  singlePlayer?: boolean;
  /** 锦标赛。 */
  tournament?: boolean;
  /** 本地玩家。 */
  localPlayer: any;
  /** 是否退出结算。 */
  isQuit?: boolean;
  /** WOL 战报。 */
  gameReport?: any;
  /** i18n 字典。 */
  strings: any;
}

/** 结算表。 */
export const ScoreTable = ({
  game,
  singlePlayer,
  tournament,
  localPlayer,
  isQuit,
  gameReport,
  strings: strings,
}: ScoreTableProps) => {
  const sorted = game
    .getNonNeutralPlayers()
    .filter((p: any) => !p.isObserver || p.defeated)
    .sort((a: any, b: any) => b.score - a.score);
  let showMmr = tournament && gameReport;
  var localReport = gameReport?.players.find(
    (p: any) => p.name.toLowerCase() === localPlayer.name.toLowerCase(),
  );
  let result = localReport?.resultType;
  if (void 0 === result) {
    if (
      game.stalemateDetectTrait?.isStale() &&
      0 === game.stalemateDetectTrait.getCountdownTicks()
    )
      result = WolGameReportResult.Draw;
    else if (localPlayer.defeated || isQuit) {
      if (
        !game.alliances
          .getAllies(localPlayer)
          .filter((a: any) => !a.isAi && !a.defeated).length
      )
        result = WolGameReportResult.Loss;
    } else if (!localPlayer.isObserver) result = WolGameReportResult.Win;
  }
  return React.createElement(
    "div",
    { className: "score-wrapper" },
    (result || !singlePlayer) &&
      React.createElement(
        "div",
        { className: "score-title" },
        React.createElement(
          "div",
          { className: "game-result" },
          result === WolGameReportResult.Win
            ? strings.get("gui:gameresultvictory")
            : result === WolGameReportResult.Draw
              ? strings.get("gui:gameresultdraw")
              : result === WolGameReportResult.Loss
                ? strings.get("gui:gameresultdefeat")
                : "",
        ),
        !gameReport &&
          !singlePlayer &&
          (tournament || void 0 === result) &&
          React.createElement(
            "div",
            { className: "pending-results" },
            strings.get("gui:gameresultwaiting"),
          ),
        localReport?.points &&
          React.createElement(
            "div",
            { className: "points-gain" },
            strings.get("GUI:LadderPoints"),
            " ",
            localReport.points.value,
            " (",
            React.createElement(PointsGain, {
              className: "points-gain-value",
              value: localReport.points.gain,
              win: result === WolGameReportResult.Win,
            }),
            ")",
          ),
      ),
    React.createElement(
      "div",
      { className: "score-header" },
      React.createElement(
        "div",
        { "data-r-tooltip": strings.get("STT:MPScoreLabelMapName") },
        strings.get("TXT_MAP", game.gameOpts.mapTitle),
      ),
      React.createElement(
        "div",
        { "data-r-tooltip": strings.get("STT:MPScoreLabelTime") },
        strings.get("GUI:Time"),
        ": ",
        formatTimeDuration(Math.floor(game.currentTime / 1000)),
      ),
    ),
    React.createElement(
      "table",
      null,
      React.createElement(
        "thead",
        null,
        React.createElement(
          "tr",
          null,
          React.createElement("th", null),
          React.createElement("th", { className: "player-rank" }),
          React.createElement(
            "th",
            {
              className: "player-name",
              "data-r-tooltip": strings.get("STT:MPScoreLabelPlayer"),
            },
            strings.get("GUI:Player"),
          ),
          showMmr &&
            React.createElement("th", { className: "number" }, strings.get("GUI:MMR")),
          React.createElement(
            "th",
            {
              className: "number",
              "data-r-tooltip": strings.get("STT:MPScoreLabelKills"),
            },
            strings.get("GUI:Kills"),
          ),
          React.createElement(
            "th",
            {
              className: "number",
              "data-r-tooltip": strings.get("STT:MPScoreLabelLosses"),
            },
            strings.get("GUI:Losses"),
          ),
          React.createElement(
            "th",
            {
              className: "number",
              "data-r-tooltip": strings.get("STT:MPScoreLabelBuilt"),
            },
            strings.get("GUI:Built"),
          ),
          React.createElement(
            "th",
            {
              className: "number",
              "data-r-tooltip": strings.get("STT:MPScoreLabelScore"),
            },
            strings.get("GUI:Score"),
          ),
        ),
      ),
      React.createElement(
        "tbody",
        null,
        sorted.map((player: any, idx: number) => {
          var report = gameReport?.players.find(
            (p: any) => p.name.toLowerCase() === player.name.toLowerCase(),
          );
          var mmrValue = report?.mmr?.value;
          var mmrGain = report?.mmr?.gain;
          return React.createElement(
            "tr",
            { key: idx, style: { color: player.color.asHexString() } },
            React.createElement(
              "td",
              null,
              React.createElement(CountryIcon, { country: player.country.name }),
            ),
            React.createElement(
              "td",
              { className: "player-rank" },
              report &&
                React.createElement(RankIndicator, {
                  playerProfile: report,
                  strings: strings,
                }),
            ),
            React.createElement(
              "td",
              {
                className: "player-name",
                "data-r-tooltip": strings.get("STT:MPScoreLabelPlayer"),
              },
              player.displayName ||
                (player.isAi
                  ? strings.get(
                      aiUiNames.get(player.aiDifficulty) || "NOSTR:AI",
                    )
                  : player.name),
            ),
            showMmr &&
              React.createElement(
                "td",
                { className: "number player-mmr" },
                mmrValue ?? "-",
                void 0 !== mmrGain &&
                  React.createElement(
                    React.Fragment,
                    null,
                    " (",
                    React.createElement(PointsGain, {
                      className: "mmr-gain",
                      value: mmrGain,
                      win: report?.resultType === WolGameReportResult.Win,
                    }),
                    ")",
                  ),
              ),
            React.createElement(
              "td",
              {
                className: "number",
                "data-r-tooltip": strings.get("STT:MPScoreLabelKills"),
              },
              player.getUnitsKilled(),
            ),
            React.createElement(
              "td",
              {
                className: "number",
                "data-r-tooltip": strings.get("STT:MPScoreLabelLosses"),
              },
              player.getUnitsLost(),
            ),
            React.createElement(
              "td",
              {
                className: "number",
                "data-r-tooltip": strings.get("STT:MPScoreLabelBuilt"),
              },
              player.getUnitsBuilt(),
            ),
            React.createElement(
              "td",
              {
                className: "number",
                "data-r-tooltip": strings.get("STT:MPScoreLabelScore"),
              },
              player.score,
            ),
          );
        }),
      ),
    ),
  );
};
