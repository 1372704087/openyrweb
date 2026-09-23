/**
 * ReplayDetailsPane — 回放详情表（时间/版本/ID/地图/玩家/时长）。
 *
 * 时间戳 <13 位按秒，否则按毫秒。
 *
 * 由 gui/screen/replay/ReplayDetailsPane.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React from "react"; // 孪生（react 外部依赖）
import { formatTimeDuration } from "util/format"; // 已转换

/** 回放详情字段。 */
export interface ReplayDetails {
  /** 引擎版本。 */
  engineVersion?: string;
  /** 时长秒。 */
  durationSeconds?: number;
  /** 对局 ID。 */
  gameId?: string;
  /** 时间戳。 */
  gameTimestamp?: number;
  /** 地图名。 */
  mapName?: string;
  /** 玩家列表。 */
  players?: { name: string; color: string }[];
}

/** 组件 props。 */
export interface ReplayDetailsPaneProps {
  /** 详情。 */
  replayDetails: ReplayDetails;
  /** i18n 字典。 */
  strings: any;
}

/** 回放详情侧栏。 */
export const ReplayDetailsPane = ({
  replayDetails: {
    engineVersion,
    durationSeconds,
    gameId,
    gameTimestamp,
    mapName,
    players,
  },
  strings: strings,
}: ReplayDetailsPaneProps) =>
  React.createElement(
    "div",
    { className: "replay-details" },
    React.createElement(
      "table",
      null,
      React.createElement(
        "tbody",
        null,
        gameTimestamp
          ? React.createElement(
              "tr",
              null,
              React.createElement("td", null, strings.get("GUI:ReplayTime"), ":"),
              React.createElement(
                "td",
                { dir: "auto" },
                new Date(
                  gameTimestamp *
                    (String(gameTimestamp).length < 13 ? 1000 : 1),
                ).toLocaleString(),
              ),
            )
          : null,
        React.createElement(
          "tr",
          null,
          React.createElement("td", null, strings.get("GUI:GameVersion"), ":"),
          React.createElement("td", null, engineVersion),
        ),
        "0" !== gameId
          ? React.createElement(
              "tr",
              null,
              React.createElement("td", null, strings.get("GUI:GameID"), ":"),
              React.createElement("td", null, gameId),
            )
          : null,
        void 0 !== mapName &&
          React.createElement(
            "tr",
            null,
            React.createElement("td", null, strings.get("GUI:Map"), ":"),
            React.createElement("td", null, mapName),
          ),
        players &&
          React.createElement(
            "tr",
            null,
            React.createElement("td", null, strings.get("GUI:Players"), ":"),
            React.createElement(
              "td",
              null,
              players.map((p, idx) =>
                React.createElement(
                  React.Fragment,
                  { key: p.name },
                  idx ? ", " : "",
                  React.createElement(
                    "span",
                    { style: { color: p.color } },
                    p.name,
                  ),
                ),
              ),
            ),
          ),
        void 0 !== durationSeconds &&
          React.createElement(
            "tr",
            null,
            React.createElement("td", null, strings.get("GUI:Duration"), ":"),
            React.createElement(
              "td",
              null,
              formatTimeDuration(durationSeconds),
            ),
          ),
      ),
    ),
  );
