/**
 * QuickGameForm — 快速游戏表单（队列类型/排名/国家颜色/战队/档案）。
 *
 * 双人时禁用 Solo1v1；无档案显示 placement 文案。
 *
 * 由 gui/screen/mainMenu/quickGame/component/QuickGameForm.ts.js
 * 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标。
 */
import classNames from "classnames"; // 孪生（classnames 外部依赖）
import { Image } from "gui/component/Image"; // 已转换
import { ButtonSelect } from "gui/component/ButtonSelect"; // 已转换
import { ColorSelect } from "gui/component/ColorSelect"; // 已转换
import { CountrySelect } from "gui/component/CountrySelect"; // 已转换
import { Option } from "gui/component/Option"; // 已转换
import React from "react"; // 孪生（react 外部依赖）
import {
  RANK_LABELS,
  RankIndicator,
} from "gui/screen/mainMenu/lobby/component/RankIndicator"; // 孪生（本组内一并转换）
import { LadderQueueType } from "network/ladder/wladderConfig"; // 已转换
import { QuickGameChat } from "gui/screen/mainMenu/quickGame/component/QuickGameChat"; // 孪生（本组内一并转换）

/** 组件 props（透传字段与孪生解构一致）。 */
export type QuickGameFormProps = any;

/** 快速游戏表单。 */
export const QuickGameForm = (t: QuickGameFormProps) => {
  let {
    strings: strings,
    disabled,
    playerName,
    playerProfile,
    unrankedEnabled,
    ranked,
    type,
    availableTypes,
    enabledTypes,
    chatProps,
    onRankedChange,
    onTypeChange,
    partyState,
    partySize,
    noInvites,
    onNoInvitesChange,
  } = t;
  return React.createElement(
    "div",
    { className: "qm-form" },
    React.createElement(
      "div",
      { className: "qm-top" },
      React.createElement(
        "div",
        { className: "opts" },
        React.createElement(
          "div",
          { className: "item qm-game-type-item" },
          React.createElement(
            "label",
            null,
            React.createElement(
              "span",
              { className: "label" },
              strings.get("GUI:QuickMatchGameMode"),
            ),
            React.createElement(
              "div",
              { className: "qm-game-type" },
              React.createElement(
                ButtonSelect,
                {
                  initialValue: type,
                  onSelect: (e: any) => onTypeChange(e),
                  disabled,
                },
                availableTypes.map((e: any) =>
                  React.createElement(Option, {
                    value: e,
                    label: e,
                    key: e,
                    disabled:
                      !enabledTypes.includes(e) ||
                      (2 === partySize && e === LadderQueueType.Solo1v1),
                  }),
                ),
              ),
              React.createElement(
                ButtonSelect,
                {
                  initialValue: String(Number(ranked)),
                  onSelect: (e: any) => {
                    onRankedChange(Boolean(Number(e)));
                  },
                  disabled,
                },
                React.createElement(Option, {
                  value: "1",
                  label: strings.get("GUI:Ranked"),
                }),
                React.createElement(Option, {
                  value: "0",
                  disabled: !unrankedEnabled,
                  label: strings.get("GUI:Unranked"),
                }),
              ),
            ),
          ),
        ),
        React.createElement(
          "div",
          { className: "item" },
          React.createElement(
            "label",
            null,
            React.createElement(
              "span",
              { className: "label" },
              strings.get("GUI:PreferredCountry"),
            ),
            React.createElement(CountrySelect, {
              countryUiNames: t.countryUiNames,
              countryUiTooltips: t.countryUiTooltips,
              country: t.country,
              availableCountries: t.availableCountries,
              disabled,
              strings: t.strings,
              onSelect: (e: any) => t.onCountrySelect(e),
            }),
          ),
        ),
        React.createElement(
          "div",
          { className: "item" },
          React.createElement(
            "label",
            null,
            React.createElement(
              "span",
              { className: "label" },
              strings.get("GUI:PreferredColor"),
            ),
            React.createElement(ColorSelect, {
              color: t.color,
              availableColors: t.availableColors,
              disabled,
              strings: t.strings,
              onSelect: (e: any) => t.onColorSelect(e),
            }),
          ),
        ),
        partyState && 0 < partyState.members.length
          ? React.createElement(
              "div",
              { className: "item" },
              React.createElement(
                "label",
                null,
                React.createElement(
                  "span",
                  { className: "label" },
                  strings.get("GUI:CurrentParty"),
                ),
                React.createElement(
                  "div",
                  { className: "party-info" },
                  React.createElement(
                    "div",
                    { className: "party-members" },
                    React.createElement(
                      "span",
                      null,
                      partyState.members.map((m: any) => m.name).join(", "),
                    ),
                  ),
                ),
              ),
            )
          : React.createElement(
              "div",
              { className: "item party-noinvites" },
              React.createElement(
                "label",
                null,
                React.createElement(
                  "span",
                  { className: "label" },
                  strings.get("GUI:PartyNoInvites"),
                ),
                React.createElement("input", {
                  type: "checkbox",
                  checked: noInvites,
                  onChange: (e: any) => onNoInvitesChange?.(e.target.checked),
                  disabled,
                }),
              ),
            ),
      ),
      React.createElement(
        "fieldset",
        { className: "qm-profile" },
        React.createElement(
          "legend",
          null,
          playerProfile?.name ?? playerName,
        ),
        void 0 === playerProfile?.rank
          ? playerProfile
            ? React.createElement(
                "div",
                { className: "item placement" },
                strings.get(
                  "GUI:LadderPlacement",
                  playerProfile.placementMatchesLeft,
                ),
              )
            : React.createElement("div", null)
          : React.createElement(
              React.Fragment,
              null,
              React.createElement(
                "div",
                { className: "player-rank" },
                React.createElement(
                  "div",
                  { className: "rank-name" },
                  React.createElement(RankIndicator, {
                    playerProfile,
                    strings: strings,
                  }),
                  " ",
                  strings.get(RANK_LABELS.get(playerProfile.rankType)),
                ),
                React.createElement(
                  "div",
                  { className: "rank-number" },
                  strings.get("GUI:Rank"),
                  " ",
                  playerProfile.rank,
                ),
              ),
              playerProfile.promotionProgress &&
                React.createElement(
                  "div",
                  {
                    className: classNames("item", "promo-progress", {
                      demotion: playerProfile.promotionProgress.demotion,
                    }),
                  },
                  React.createElement(
                    "span",
                    { className: "label" },
                    strings.get("GUI:LadderPromoProgress"),
                  ),
                  React.createElement(
                    "span",
                    { className: "value" },
                    React.createElement(
                      "div",
                      { className: "next-rank" },
                      strings.get(
                        RANK_LABELS.get(
                          playerProfile.promotionProgress.rankType,
                        ),
                      ),
                      playerProfile.promotionProgress.demotion
                        ? React.createElement(
                            "span",
                            { className: "demotion-indicator" },
                            "▼",
                          )
                        : React.createElement(
                            "span",
                            { className: "promotion-indicator" },
                            "▲",
                          ),
                    ),
                    React.createElement("progress", {
                      value: playerProfile.promotionProgress.progress,
                      max: 1,
                    }),
                  ),
                ),
              React.createElement("hr", null),
              React.createElement(
                "div",
                { className: "item" },
                React.createElement(
                  "span",
                  { className: "label" },
                  strings.get("GUI:LadderWins"),
                ),
                React.createElement(
                  "span",
                  { className: "value" },
                  playerProfile.wins ?? strings.get("GUI:UnknownStats"),
                ),
              ),
              void 0 !== playerProfile.points &&
                React.createElement(
                  "div",
                  { className: "item" },
                  React.createElement(
                    "span",
                    { className: "label" },
                    strings.get("GUI:LadderPoints"),
                  ),
                  React.createElement(
                    "span",
                    { className: "value" },
                    playerProfile.points,
                  ),
                ),
              void 0 !== playerProfile.bonusPool &&
                React.createElement(
                  "div",
                  { className: "item" },
                  React.createElement(
                    "span",
                    { className: "label" },
                    strings.get("GUI:ProfileBonusPool"),
                  ),
                  React.createElement(
                    "span",
                    { className: "value" },
                    playerProfile.bonusPool,
                  ),
                ),
              void 0 !== playerProfile.mmr &&
                React.createElement(
                  "div",
                  { className: "item" },
                  React.createElement(
                    "span",
                    { className: "label" },
                    strings.get("GUI:ProfileMMR"),
                  ),
                  React.createElement(
                    "span",
                    { className: "value" },
                    playerProfile.mmr,
                    void 0 !== playerProfile.provisionalMmr &&
                      React.createElement(
                        "span",
                        {
                          className: "info",
                          title:
                            strings.get("gui:profileprovmmr") +
                            " " +
                            playerProfile.provisionalMmr,
                        },
                        React.createElement(Image, { src: "info.png" }),
                      ),
                  ),
                ),
            ),
      ),
    ),
    React.createElement(
      "div",
      { className: "qm-bottom" },
      React.createElement(QuickGameChat, { ...chatProps }),
    ),
  );
};
