/**
 * Ladder — 天梯视图（赛季信息 / 排行表 + 搜索分页）。
 *
 * 当前/上一赛季特殊文案；赛季信息与表格切换；current 赛季且有
 * region 时玩家名链到 leaderboard。
 *
 * 由 gui/screen/mainMenu/ladder/component/Ladder.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React, { useEffect, useRef, useState } from "react"; // 孪生（react 外部依赖）
import classNames from "classnames"; // 孪生（classnames 外部依赖）
import { RankIndicator } from "gui/screen/mainMenu/lobby/component/RankIndicator"; // 孪生（本组内一并转换）
import { Select } from "gui/component/Select"; // 已转换
import { Option } from "gui/component/Option"; // 已转换
import { LadderType } from "network/ladder/wladderConfig"; // 已转换
import { List, ListItem } from "gui/component/List"; // 已转换
import { WLadderService } from "network/ladder/WLadderService"; // 已转换

/** 赛季显示名。 */
function seasonLabel(season: any, strings: any) {
  return season === WLadderService.CURRENT_SEASON
    ? strings.get("GUI:LadderCurrent")
    : season === WLadderService.PREV_SEASON
      ? strings.get("GUI:LadderPrev")
      : strings.get("GUI:LadderSeason", season);
}

function formatDate(ts: any) {
  return new Date(ts).toLocaleDateString(void 0, { dateStyle: "medium" });
}

function formatTime(ts: any) {
  return new Date(ts).toLocaleTimeString(void 0, { timeStyle: "short" });
}

/** 分组类型 → key。 */
const TYPE_LABEL_KEYS = new Map<any, string>([
  [LadderType.Solo1v1, "gui:laddertype1v1"],
  [LadderType.Random2v2, "gui:laddertype2v2random"],
]);

/** 组件 props。 */
export interface LadderProps {
  /** 玩家列表（undefined=加载中）。 */
  players?: any[];
  /** 高亮玩家名。 */
  highlightPlayer?: string;
  /** 有上一页。 */
  hasPrevPage?: boolean;
  /** 有下一页。 */
  hasNextPage?: boolean;
  /** 赛季列表。 */
  seasons?: number[];
  /** 当前赛季。 */
  selectedSeason?: number;
  /** 赛季详情。 */
  seasonDetails?: any;
  /** 分组列表。 */
  ladders?: any[];
  /** 当前分组。 */
  selectedLadder?: any;
  /** 服务器区域。 */
  serverRegion?: any;
  /** 禁用交互。 */
  disabled?: boolean;
  /** i18n 字典。 */
  strings: any;
  onFirstPageClick?: () => void;
  onPrevPageClick?: () => void;
  onNextPageClick?: () => void;
  onLastPageClick?: () => void;
  onPlayerSearch?: (name: string) => void;
  onSeasonSelect?: (season: number) => void;
  onLadderSelect?: (ladder: any) => void;
  onLadderTypeSelect?: (type: any) => void;
}

/** 天梯表。 */
const LadderTable = ({
  players,
  highlightPlayer,
  ladderType,
  region,
  season,
  showPoints,
  showMmr,
  strings: strings,
  hasPrevPage,
  hasNextPage,
  disabled,
  onFirstPageClick,
  onPrevPageClick,
  onNextPageClick,
  onLastPageClick,
}: any) =>
  React.createElement(
    "div",
    { className: "ladder-table" },
    React.createElement(
      "table",
      null,
      React.createElement(
        "thead",
        null,
        React.createElement(
          "tr",
          null,
          React.createElement("th", { className: "player-rank" }, "#"),
          React.createElement(
            "th",
            { className: "player-rank-icon" },
            strings.get("GUI:Rank"),
          ),
          React.createElement(
            "th",
            { className: "player-name" },
            strings.get("GUI:Name"),
          ),
          showPoints &&
            React.createElement(
              "th",
              { className: "player-points" },
              strings.get("GUI:Points"),
            ),
          showMmr &&
            React.createElement(
              "th",
              { className: "player-mmr" },
              strings.get("GUI:MMR"),
            ),
          React.createElement(
            "th",
            { className: "player-wins" },
            strings.get("GUI:NumberWins"),
          ),
          React.createElement(
            "th",
            { className: "player-losses" },
            strings.get("GUI:NumberLosses"),
          ),
        ),
      ),
      React.createElement(
        "tbody",
        null,
        players.map((p: any) =>
          React.createElement(
            "tr",
            {
              key: p.name,
              className: classNames({
                selected:
                  highlightPlayer?.toLowerCase() === p.name.toLowerCase(),
                disabled:
                  void 0 === p.points && !p.wins && !p.losses && !p.draws,
              }),
            },
            React.createElement("td", { className: "player-rank" }, p.rank),
            React.createElement(
              "td",
              { className: "player-rank-icon" },
              React.createElement(RankIndicator, {
                playerProfile: p,
                strings: strings,
              }),
            ),
            React.createElement(
              "td",
              { className: "player-name" },
              (() => {
                var name = p.name;
                var type = ladderType;
                var reg = region;
                var url =
                  reg && type && season === WLadderService.CURRENT_SEASON
                    ? reg.leaderboardUrl
                      ? `${reg.leaderboardUrl}/player/${reg.id}/${type}/` + name
                      : void 0
                    : void 0;
                return url
                  ? React.createElement(
                      "a",
                      { href: url, target: "_blank", rel: "noopener" },
                      name,
                    )
                  : name;
              })(),
            ),
            showPoints &&
              React.createElement(
                "td",
                { className: "player-points" },
                p.points,
              ),
            showMmr &&
              React.createElement("td", { className: "player-mmr" }, p.mmr),
            React.createElement("td", { className: "player-wins" }, p.wins),
            React.createElement(
              "td",
              { className: "player-losses" },
              p.losses ?? 0,
            ),
          ),
        ),
      ),
    ),
    (hasPrevPage || hasNextPage) &&
      React.createElement(
        "div",
        { className: "pagination" },
        React.createElement(
          "button",
          {
            className: "first-page",
            disabled: !hasPrevPage || disabled,
            onClick: onFirstPageClick,
          },
          "<<",
        ),
        React.createElement(
          "button",
          {
            className: "prev-page",
            disabled: !hasPrevPage || disabled,
            onClick: onPrevPageClick,
          },
          "<",
        ),
        React.createElement(
          "button",
          {
            className: "next-page",
            disabled: !hasNextPage || disabled,
            onClick: onNextPageClick,
          },
          ">",
        ),
        React.createElement(
          "button",
          {
            className: "last-page",
            disabled: !hasNextPage || disabled,
            onClick: onLastPageClick,
          },
          ">>",
        ),
      ),
  );

/** 天梯主视图。 */
export const Ladder = (props: LadderProps) => {
  const {
    players,
    highlightPlayer,
    hasPrevPage,
    hasNextPage,
    seasons,
    selectedSeason,
    seasonDetails,
    ladders,
    selectedLadder,
    serverRegion,
    disabled,
    strings: strings,
    onFirstPageClick,
    onPrevPageClick,
    onNextPageClick,
    onLastPageClick,
    onPlayerSearch,
    onSeasonSelect,
    onLadderSelect,
    onLadderTypeSelect,
  } = props;
  if (!players)
    return React.createElement(
      "div",
      { className: "ladder" },
      strings.get("GUI:LoadingEx"),
    );
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [showSeasonInfo, setShowSeasonInfo] = useState(!selectedLadder);
  useEffect(() => {
    setShowSeasonInfo(!selectedLadder);
  }, [selectedLadder]);
  const keyOf = (l: any) => l.type + "_" + l.id;
  var hasMmr = players.some((p: any) => void 0 !== p.mmr);
  var hasPoints = players.some((p: any) => void 0 !== p.points);
  let currentType = selectedLadder?.type;
  let typeOptions = [
    ...new Set(
      seasonDetails?.ladders.map((l: any) => l.type) ??
        (currentType ? [currentType] : void 0),
    ),
  ];
  var rankedCount = seasonDetails?.totalRankedPlayers.find(
    (x: any) => x.ladderType === currentType,
  )?.value;
  return React.createElement(
    "div",
    { className: "ladder" },
    React.createElement(
      "div",
      {
        className: classNames("toolbar", {
          "no-season-select": !seasons || seasons.length < 2,
        }),
      },
      void 0 !== seasons &&
        0 < seasons.length &&
        React.createElement(
          Select,
          {
            disabled,
            initialValue: selectedSeason ?? seasons[0],
            onSelect: onSeasonSelect,
            className: "season-select",
          },
          seasons.map((s) =>
            React.createElement(Option, {
              key: s,
              label: seasonLabel(s, strings),
              value: s,
            }),
          ),
        ),
      !showSeasonInfo &&
        React.createElement(
          React.Fragment,
          null,
          void 0 !== ladders &&
            0 < ladders.length &&
            React.createElement(
              Select,
              {
                disabled,
                initialValue: keyOf(selectedLadder ?? ladders[0]),
                onSelect: (value: string) => {
                  let [type, id] = ((raw: string): [string, number] => {
                    var [t, i] = raw.split("_");
                    return [t, Number(i)];
                  })(value);
                  var ladder = ladders?.find(
                    (l: any) => l.id === id && l.type === type,
                  );
                  if (ladder) onLadderSelect?.(ladder);
                },
                className: "ladder-select",
              },
              ladders.map((l: any) =>
                React.createElement(Option, {
                  key: l.type + "_" + l.id,
                  label:
                    l.name +
                    (l.divisionName
                      ? ", " + strings.get("GUI:LadderDivision", l.divisionName)
                      : ""),
                  value: keyOf(l),
                }),
              ),
              rankedCount
                ? React.createElement(Option, {
                    label: strings.get("GUI:LadderRankedPlayers", rankedCount),
                    disabled: true,
                    value: "",
                  })
                : void 0,
            ),
          React.createElement(
            "form",
            {
              className: "player-search",
              onSubmit: (e: any) => {
                e.preventDefault();
                if (searchRef.current?.value) {
                  onPlayerSearch?.(searchRef.current.value);
                  searchRef.current.value = "";
                }
              },
            },
            React.createElement("input", {
              className: "player",
              type: "text",
              disabled,
              ref: searchRef,
              placeholder: strings.get("GUI:Player"),
            }),
            React.createElement(
              "button",
              { type: "submit", disabled },
              strings.get("GUI:Search"),
            ),
          ),
        ),
    ),
    React.createElement(
      "div",
      { className: "ladder-content" },
      React.createElement(
        List,
        { className: "ladder-types" },
        React.createElement(
          ListItem,
          {
            selected: showSeasonInfo,
            disabled,
            onClick: () => setShowSeasonInfo(true),
          },
          strings.get("gui:ladderseasoninfo"),
        ),
        typeOptions.map((type: any) =>
          React.createElement(
            ListItem,
            {
              key: type,
              selected: !showSeasonInfo && currentType === type,
              disabled,
              onClick: () => {
                setShowSeasonInfo(false);
                onLadderTypeSelect?.(type);
              },
            },
            strings.get(TYPE_LABEL_KEYS.get(type) ?? type),
          ),
        ),
      ),
      showSeasonInfo && seasonDetails
        ? React.createElement(
            "div",
            { className: "season-info" },
            React.createElement(
              "header",
              null,
              React.createElement(
                "h2",
                null,
                seasonLabel(seasonDetails.name, strings),
              ),
              void 0 !== seasonDetails.startTime &&
                void 0 !== seasonDetails.endTime &&
                React.createElement(
                  "p",
                  null,
                  formatDate(seasonDetails.startTime) +
                    " - " +
                    formatDate(seasonDetails.endTime),
                ),
            ),
            void 0 !== seasonDetails.topTierStartTime &&
              React.createElement(
                "div",
                { className: "item" },
                React.createElement(
                  "span",
                  { className: "label" },
                  strings.get("gui:laddertoptierstart"),
                ),
                React.createElement(
                  "span",
                  { className: "label" },
                  formatDate(seasonDetails.topTierStartTime),
                ),
              ),
            void 0 !== seasonDetails.nextTopTierDemoteTime &&
              React.createElement(
                "div",
                { className: "item" },
                React.createElement(
                  "span",
                  { className: "label" },
                  strings.get("gui:laddertoptierdemotions"),
                ),
                React.createElement(
                  "span",
                  { className: "label" },
                  formatTime(seasonDetails.nextTopTierDemoteTime),
                ),
              ),
            void 0 !== seasonDetails.nextTopTierPromoteTime &&
              React.createElement(
                "div",
                { className: "item" },
                React.createElement(
                  "span",
                  { className: "label" },
                  strings.get("gui:laddertoptierpromotions"),
                ),
                React.createElement(
                  "span",
                  { className: "label" },
                  formatTime(seasonDetails.nextTopTierPromoteTime),
                ),
              ),
            void 0 !== seasonDetails.lockTime &&
              React.createElement(
                "div",
                { className: "item" },
                React.createElement(
                  "span",
                  { className: "label" },
                  strings.get("gui:ladderseasonlock"),
                ),
                React.createElement(
                  "span",
                  { className: "value" },
                  formatDate(seasonDetails.lockTime),
                ),
              ),
          )
        : React.createElement(LadderTable, {
            players,
            highlightPlayer,
            ladderType: selectedLadder?.type ?? ladders?.[0].type,
            region: serverRegion,
            season: selectedSeason,
            showPoints: hasPoints,
            showMmr: hasMmr,
            strings: strings,
            hasPrevPage,
            hasNextPage,
            disabled,
            onFirstPageClick,
            onPrevPageClick,
            onNextPageClick,
            onLastPageClick,
          }),
    ),
  );
};
