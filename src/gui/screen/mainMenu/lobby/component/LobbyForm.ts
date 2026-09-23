/**
 * LobbyForm — 大厅/遭遇战玩家槽与游戏选项表单。
 *
 * 单人/房主可改选项；访客只读。槽位下拉含 AI 难度/开放/关闭/观战。
 *
 * 由 gui/screen/mainMenu/lobby/component/LobbyForm.ts.js 重写为 TS。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React from "react"; // 孪生（react 外部依赖）
import classNames from "classnames"; // 孪生（classnames 外部依赖）
import {
  LobbyType,
  PlayerStatus,
  SlotOccupation,
  SlotType,
} from "gui/screen/mainMenu/lobby/component/viewmodel/lobby"; // 孪生（本组内一并转换）
import { Slider } from "gui/component/Slider"; // 已转换
import { Chat } from "gui/component/Chat"; // 已转换
import { CountrySelect } from "gui/component/CountrySelect"; // 已转换
import { ColorSelect } from "gui/component/ColorSelect"; // 已转换
import { PingIndicator } from "gui/component/PingIndicator"; // 已转换
import { AiDifficulty } from "game/gameopts/GameOpts"; // 已转换
import { Image } from "gui/component/Image"; // 已转换
import { StartPosSelect } from "gui/component/StartPosSelect"; // 已转换
import { TeamSelect } from "gui/component/TeamSelect"; // 已转换
import { NO_TEAM_ID, aiUiTooltips } from "game/gameopts/constants"; // 已转换
import { Select } from "gui/component/Select"; // 已转换
import { Option } from "gui/component/Option"; // 已转换
import { isNotNullOrUndefined } from "util/typeGuard"; // 已转换
import { RankIndicator } from "gui/screen/mainMenu/lobby/component/RankIndicator"; // 孪生（本组内一并转换）

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 大厅表单 props。 */
export type LobbyFormProps = any;


/** 主机选项复选框（模块级，避免挂到 prototype 与孪生对齐）。 */
function renderCheckboxes(props: any, strings: any, enabled: boolean) {
    const box = (
      tooltipKey: string,
      name: string,
      checked: boolean,
      labelKey: string,
      onChange?: (v: boolean) => void,
      disabledOverride?: boolean,
    ) =>
      React.createElement(
        "div",
        { "data-r-tooltip": strings.get(tooltipKey) },
        React.createElement(
          "label",
          null,
          React.createElement("input", {
            type: "checkbox",
            name,
            checked,
            onChange: onChange ? (e: any) => onChange(e.target.checked) : undefined,
            disabled: disabledOverride ?? !enabled,
          }),
          " ",
          React.createElement("span", null, strings.get(labelKey)),
        ),
      );
    return [
      box(
        "STT:HostCBoxShortGame",
        "shortGame",
        props.shortGame,
        "GUI:ShortGame",
        (v) => this.props.onToggleShortGame(v),
      ),
      box(
        "STT:HostCBoxRedeploys",
        "mcvRepacks",
        props.mcvRepacks,
        "GUI:MCVRepacks",
        (v) => this.props.onToggleMcvRepacks(v),
      ),
      box(
        "STT:HostCBoxCrates",
        "cratesAppear",
        props.cratesAppear,
        "GUI:CratesAppear",
        (v) => this.props.onToggleCratesAppear(v),
      ),
      box(
        "STT:HostCBoxSWAllowed",
        "superWeapons",
        props.superWeapons,
        "GUI:SuperWeaponsAllowed",
        (v) => this.props.onToggleSuperWeapons(v),
      ),
      void 0 !== props.hostTeams &&
        box(
          "STT:HostCBoxHostTeams",
          "hostTeams",
          props.hostTeams,
          "GUI:HostTeams",
          (v) => this.props.onToggleHostTeams?.(v),
        ),
      box(
        "STT:DestroyableBridges",
        "destBridges",
        props.destroyableBridges,
        "GUI:DestroyableBridges",
        (v) => this.props.onToggleDestroyableBridges?.(v),
      ),
      box(
        "STT:MultiEngineer",
        "multiEngineer",
        props.multiEngineer,
        "GUI:MultiEngineer",
        (v) => this.props.onToggleMultiEngineer?.(v),
      ),
      // instantCapture 的 tooltip 需要 multiEngineerCount，单独处理
      React.createElement(
        "div",
        {
          "data-r-tooltip": strings.get(
            "STT:InstantCapture",
          ),
        },
        React.createElement(
          "label",
          null,
          React.createElement("input", {
            type: "checkbox",
            name: "instantCapture",
            checked: props.instantCapture || props.multiEngineer,
            onChange: (e: any) =>
              this.props.onToggleInstantCapture?.(e.target.checked),
            disabled: !enabled || props.multiEngineer,
          }),
          " ",
          React.createElement(
            "span",
            null,
            strings.get("GUI:InstantCapture"),
          ),
        ),
      ),
      box(
        "STT:NoDogEngiKills",
        "noDogEngiKills",
        props.noDogEngiKills,
        "GUI:NoDogEngiKills",
        (v) => this.props.onToggleNoDogEngiKills?.(v),
      ),
      box(
        "STT:DelayedOils",
        "delayedOils",
        props.delayedOils,
        "GUI:DelayedOils",
        (v) => this.props.onToggleDelayedOils?.(v),
      ),
    ].filter(Boolean);}

/** 大厅表单组件。 */
export class LobbyForm extends React.Component<LobbyFormProps> {
  /** JSX props。 */
  props: LobbyFormProps;
  /** 槽位角色下拉选择。 */
  onPlayerSelect = (value: string, index: number) => {
    if (value === "player") {
      this.props.onSlotChange("player", index);
    } else {
      let occupation: any;
      let difficulty: any;
      if (value.match(/^\d+$/)) occupation = Number(value);
      else {
        occupation = SlotOccupation.Occupied;
        difficulty = (AiDifficulty as any)[value];
      }
      this.props.onSlotChange(occupation, index, difficulty);
    }
  };

  render() {
    let { strings: strings, lobbyType, mpDialogSettings } = this.props;
    var isHostLike =
      lobbyType === LobbyType.Singleplayer ||
      lobbyType === LobbyType.MultiplayerHost;
    var isSp = lobbyType === LobbyType.Singleplayer;
    let props = this.props;
    return React.createElement(
      "div",
      {
        className: classNames("lobby-form", {
          "lobby-form-sp": isSp,
          "lobby-form-server-sel": props.selectedGameServer,
        }),
      },
      props.selectedGameServer &&
        React.createElement(
          "div",
          { className: "game-server" },
          React.createElement(
            "span",
            { className: "label" },
            strings.get("TS:ServerLabel"),
          ),
          React.createElement(
            Select,
            { initialValue: props.selectedGameServer, disabled: true },
            React.createElement(Option, {
              label: props.selectedGameServer,
              value: props.selectedGameServer,
            }),
          ),
        ),
      React.createElement(
        "div",
        { className: "player-slots" },
        React.createElement(
          "div",
          { className: "player-slot player-slot-header" },
          React.createElement(
            "div",
            { className: "player-header-players" },
            strings.get("GUI:Players"),
          ),
          React.createElement(
            "div",
            { className: "player-header-side" },
            strings.get("GUI:Side"),
          ),
          React.createElement(
            "div",
            { className: "player-header-color" },
            strings.get("GUI:Color"),
          ),
          React.createElement(
            "div",
            { className: "player-header-position" },
            strings.get("GUI:StartPosition"),
          ),
          React.createElement(
            "div",
            { className: "player-header-team" },
            strings.get("GUI:Team"),
          ),
        ),
        props.playerSlots.map((slot: any, idx: number) =>
          this.renderPlayerSlot(props, slot, idx),
        ),
      ),
      React.createElement(
        "div",
        { className: "game-options" },
        React.createElement(
          "div",
          { className: "game-options-left" },
          ...renderCheckboxes(props, strings, isHostLike),
        ),
        React.createElement(
          "div",
          {
            className:
              "game-options-right" + (isHostLike ? "" : " all-disabled"),
          },
          React.createElement(
            "div",
            { className: "slider-item" },
            React.createElement(
              "span",
              { className: "label" },
              strings.get("GUI:GameSpeed"),
            ),
            React.createElement(Slider, {
              name: "gameSpeed",
              min: 0,
              max: 6,
              value: "" + props.gameSpeed,
              disabled: !isHostLike,
              "data-r-tooltip": strings.get("STT:HostSliderSpeed"),
              onChange: (e: any) =>
                this.props.onChangeGameSpeed(Number(e.target.value)),
            }),
          ),
          React.createElement(
            "div",
            { className: "slider-item" },
            React.createElement(
              "span",
              { className: "label" },
              strings.get("GUI:Credits"),
            ),
            React.createElement(Slider, {
              name: "credits",
              min: mpDialogSettings.minMoney,
              max: mpDialogSettings.maxMoney,
              step: mpDialogSettings.moneyIncrement,
              value: "" + props.credits,
              "data-r-tooltip": strings.get("STT:HostSliderCredits"),
              onChange: (e: any) =>
                this.props.onChangeCredits(Number(e.target.value)),
              disabled: !isHostLike,
            }),
          ),
          React.createElement(
            "div",
            { className: "slider-item" },
            React.createElement(
              "span",
              { className: "label" },
              strings.get("GUI:UnitCount"),
            ),
            React.createElement(Slider, {
              name: "unitCount",
              min: mpDialogSettings.minUnitCount,
              max: mpDialogSettings.maxUnitCount,
              value: "" + props.unitCount,
              "data-r-tooltip": strings.get("STT:HostSliderUnit"),
              onChange: (e: any) =>
                this.props.onChangeUnitCount(Number(e.target.value)),
              disabled: !isHostLike,
            }),
          ),
          React.createElement(
            "div",
            {
              className: "checkbox-item",
              "data-r-tooltip": strings.get("STT:HostCBoxBuildOffAlly"),
            },
            React.createElement(
              "label",
              null,
              React.createElement("input", {
                type: "checkbox",
                name: "buildOffAlly",
                checked: props.buildOffAlly,
                disabled: !isHostLike,
                onChange: (e: any) =>
                  this.props.onToggleBuildOffAlly(e.target.checked),
              }),
              " ",
              React.createElement(
                "span",
                null,
                strings.get("GUI:BuildOffAlly"),
              ),
            ),
          ),
        ),
      ),
      void 0 !== this.props.messages &&
        void 0 !== this.props.localUsername &&
        this.props.onSendMessage &&
        React.createElement(Chat, {
          messages: this.props.messages,
          localUsername: this.props.localUsername,
          channels: this.props.channels ?? [],
          chatHistory: this.props.chatHistory,
          onSendMessage: this.props.onSendMessage,
          tooltips: {
            button: strings.get("STT:EmoteButton"),
            input: isHostLike
              ? strings.get("STT:HostEditInput")
              : strings.get("STT:GuestEditInput"),
            output: isHostLike
              ? strings.get("STT:HostEditOutput")
              : strings.get("STT:GuestEditOutput"),
          },
          strings: strings,
        }),
    );
  }

  /** 左侧规则开关组（贴孪生顺序）。 */

  /** 单行玩家槽。 */
  renderPlayerSlot(props: any, slot: any, index: number) {
    const strings = props.strings;
    var isHostLike =
      props.lobbyType === LobbyType.Singleplayer ||
      props.lobbyType === LobbyType.MultiplayerHost;
    if (!slot)
      return React.createElement(
        "div",
        { className: "player-slot", key: "playerslot" + index },
      );
    return React.createElement(
      "div",
      { className: "player-slot", key: "playerslot" + index },
      slot.type === SlotType.Player
        ? React.createElement(RankIndicator, {
            playerProfile: slot.playerProfile,
            strings,
          })
        : React.createElement(RankIndicator, {
            playerProfile: void 0,
            strings,
          }),
      React.createElement(PingIndicator, {
        ping: slot.type === SlotType.Player ? slot.ping : void 0,
        strings,
      }),
      React.createElement(
        "div",
        {
          className: "player-status",
          "data-r-tooltip": strings.get("STT:HostPictureAcceptance"),
        },
        this.renderPlayerStatus(slot.status),
      ),
      this.renderPlayerSelect(slot, index, props.lobbyType),
      React.createElement(CountrySelect, {
        countryUiNames: props.countryUiNames,
        countryUiTooltips: props.countryUiTooltips,
        country: slot.country,
        availableCountries: props.availablePlayerCountries,
        disabled:
          (index !== props.activeSlotIndex &&
            (!isHostLike || slot.type !== SlotType.Ai)) ||
          slot.type === SlotType.Observer ||
          (slot.status === PlayerStatus.Ready &&
            slot.type !== SlotType.Ai),
        strings: props.strings,
        onSelect: (v: any) => this.props.onCountrySelect(v, index),
      }),
      slot.type !== SlotType.Observer
        ? React.createElement(
            React.Fragment,
            null,
            React.createElement(ColorSelect, {
              color: slot.color,
              availableColors: props.availablePlayerColors,
              disabled:
                (index !== props.activeSlotIndex &&
                  (!isHostLike || slot.type !== SlotType.Ai)) ||
                (slot.status === PlayerStatus.Ready &&
                  slot.type !== SlotType.Ai),
              strings: props.strings,
              onSelect: (v: any) => this.props.onColorSelect(v, index),
            }),
            React.createElement(StartPosSelect, {
              disabled: props.hostTeams
                ? !isHostLike ||
                  slot.occupation !== SlotOccupation.Occupied
                : (index !== props.activeSlotIndex &&
                    (!isHostLike || slot.type !== SlotType.Ai)) ||
                  (slot.status === PlayerStatus.Ready &&
                    slot.type !== SlotType.Ai),
              startPos: slot.startPos,
              availableStartPositions: props.availableStartPositions,
              onSelect: (v: any) =>
                this.props.onStartPosSelect(v, index),
              strings: props.strings,
            }),
            React.createElement(TeamSelect, {
              disabled:
                !props.teamsAllowed ||
                (props.hostTeams
                  ? !isHostLike ||
                    slot.occupation !== SlotOccupation.Occupied
                  : (index !== props.activeSlotIndex &&
                      (!isHostLike || slot.type !== SlotType.Ai)) ||
                    (slot.status === PlayerStatus.Ready &&
                      slot.type !== SlotType.Ai)),
              teamId: props.teamsAllowed ? slot.team : NO_TEAM_ID,
              required: props.teamsRequired,
              maxTeams: props.maxTeams,
              onSelect: (v: any) => this.props.onTeamSelect(v, index),
              strings: props.strings,
            }),
          )
        : null,
    );
  }

  /** 状态图标（Host/Ready）。 */
  renderPlayerStatus(status: any) {
    return status === PlayerStatus.Host
      ? React.createElement(Image, { src: "wolhost.pcx" })
      : status === PlayerStatus.Ready
        ? React.createElement(Image, { src: "wolacpt.pcx" })
        : null;
  }

  /** 槽位角色下拉（含 AI 难度选项）。 */
  renderPlayerSelect(slot: any, index: number, lobbyType: any) {
    let isSp = lobbyType === LobbyType.Singleplayer;
    var canEdit = isSp || lobbyType === LobbyType.MultiplayerHost;
    let strings = this.props.strings;
    let options = new Map<any, string>();
    let initial: any;
    if (index === 0 && isSp) {
      options.set(
        "player",
        strings.get("GUI:Player") + ": " + (slot.name || ""),
      );
    }
    options.set(SlotOccupation.Occupied, slot.name || "");
    options.set(
      SlotOccupation.Open,
      strings.get(
        slot.type === SlotType.Observer
          ? "GUI:OpenObserver"
          : "GUI:Open",
      ),
    );
    if (index !== 0 || !isSp)
      options.set(
        SlotOccupation.Closed,
        isSp ? strings.get("GUI:None") : strings.get("GUI:Closed"),
      );
    options.set(SlotOccupation.Observer, strings.get("GUI:Observer"));
    initial = slot.occupation;
    if (
      slot.occupation === SlotOccupation.Occupied &&
      slot.type === SlotType.Ai
    ) {
      options.delete(SlotOccupation.Occupied);
      initial = (AiDifficulty as any)[slot.aiDifficulty];
    }
    if (
      index === 0 &&
      isSp &&
      slot.type === SlotType.Player &&
      slot.occupation !== SlotOccupation.Observer
    ) {
      options.delete(SlotOccupation.Occupied);
      initial = "player";
    }
    if (slot.type !== SlotType.Observer)
      this.props.availableAiNames.forEach((label: any, diff: any) => {
        options.set((AiDifficulty as any)[diff], strings.get(label));
      });
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        Select,
        {
          initialValue: "" + initial,
          disabled: !canEdit,
          onSelect: (v: string) => this.onPlayerSelect(v, index),
          className: "player-name",
          tooltip: isSp
            ? strings.get("STT:SkirmishComboAiPlayer")
            : strings.get("STT:HostComboPlayer"),
        },
        [...options]
          .map(([key, label]) =>
            (key === SlotOccupation.Occupied &&
              slot.occupation !== SlotOccupation.Occupied) ||
            (key === SlotOccupation.Open && isSp) ||
            (key === SlotOccupation.Observer && !isSp)
              ? null
              : React.createElement(Option, {
                  key: key,
                  value: "" + key,
                  label,
                  tooltip: isSp
                    ? (() => {
                        let tip =
                          key === SlotOccupation.Closed
                            ? "STT:PlayerNone"
                            : (aiUiTooltips as any).get(
                                (AiDifficulty as any)[key],
                              );
                        return tip ? strings.get(tip) : void 0;
                      })()
                    : void 0,
                }),
          )
          .filter(isNotNullOrUndefined),
      ),
      null,
    );
  }
}
