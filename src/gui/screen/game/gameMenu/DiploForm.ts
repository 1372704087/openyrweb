/**
 * DiploForm — 外交表单：玩家表、游戏设置摘要、taunt/聊天。
 *
 * 由 gui/screen/game/gameMenu/DiploForm.ts.js
 * 重写为 TS（行为完全一致）。
 */
import * as ReactModule from "react"; // 孪生
import * as AlliancesModule from "game/Alliances"; // 孪生
import * as constantsModule from "game/gameopts/constants"; // 孪生
import * as CountryIconModule from "gui/component/CountryIcon"; // 孪生
import * as ChatModule from "gui/component/Chat"; // 孪生
import * as gservConfigModule from "network/gservConfig"; // 孪生
import * as PingIndicatorModule from "gui/component/PingIndicator"; // 孪生
import * as PlayerConnectionStatusModule from "network/gamestate/PlayerConnectionStatus"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim
const React: any = (ReactModule as any).default ?? ReactModule;
const AllianceStatus: any = (AlliancesModule as any).AllianceStatus;
const CountryIcon: any = (CountryIconModule as any).CountryIcon;
const Chat: any = (ChatModule as any).Chat;
const PingIndicator: any = (PingIndicatorModule as any).PingIndicator;
const OBS_COUNTRY_NAME: any = (constantsModule as any).OBS_COUNTRY_NAME;
const aiUiNames: any = (constantsModule as any).aiUiNames;
const RECIPIENT_ALL: any = (gservConfigModule as any).RECIPIENT_ALL;
const RECIPIENT_TEAM: any = (gservConfigModule as any).RECIPIENT_TEAM;
const PlayerConnectionStatus: any = (PlayerConnectionStatusModule as any).PlayerConnectionStatus;

/**
 * 外交表单。
 * @param props 由 DiploScreen.initView 注入
 */
export function DiploForm(props: {
  strings: any;
  playerInfos: any[];
  localPlayer?: any;
  taunts?: boolean;
  singlePlayer?: boolean;
  alliancesAllowed?: boolean;
  gameModes: any;
  gameOpts: any;
  mapName: string;
  messages?: any[];
  chatHistory?: any;
  conInfos?: any[];
  onToggleTaunts: (v: boolean) => void;
  onToggleAlliance: (player: any, form: boolean) => void;
  onToggleChat: (player: any, enabled: boolean) => void;
  onSendMessage: (msg: any) => void;
  onCancelMessage: (force?: any) => void;
}): any {
  const {
    strings,
    playerInfos,
    localPlayer,
    taunts,
    singlePlayer,
    alliancesAllowed,
    gameModes,
    gameOpts,
    mapName,
    messages,
    chatHistory,
    conInfos,
    onToggleTaunts,
    onToggleAlliance,
    onToggleChat,
    onSendMessage,
    onCancelMessage,
  } = props;
  const gameTypeName = strings.get(gameModes.getById(gameOpts.gameMode).label);
  const onOff = (v: any) => (v ? strings.get("TXT_ON") : strings.get("TXT_OFF"));
  return React.createElement(
    "div",
    { className: "diplo-form" },
    React.createElement(
      "div",
      { className: "players" },
      React.createElement(
        "table",
        null,
        React.createElement(
          "thead",
          null,
          React.createElement(
            "tr",
            null,
            React.createElement("th", { className: "player-country" }),
            React.createElement("th", { className: "player-ping" }),
            React.createElement("th", { className: "player-name" }, strings.get("GUI:Player")),
            React.createElement("th", null, strings.get("GUI:Allies")),
            !singlePlayer && React.createElement("th", null, strings.get("GUI:Chat")),
            React.createElement("th", null, strings.get("GUI:Kills")),
          ),
        ),
        React.createElement(
          "tbody",
          null,
          localPlayer &&
            React.createElement(
              "tr",
              { style: { color: localPlayer.defeated ? "grey" : localPlayer.color.asHexString() } },
              React.createElement(
                "td",
                { className: "player-country" },
                React.createElement(CountryIcon, {
                  country: localPlayer.country ? localPlayer.country.name : OBS_COUNTRY_NAME,
                }),
              ),
              React.createElement(
                "td",
                { className: "player-ping" },
                (() => {
                  const ping = conInfos?.find((c) => c.name === localPlayer.name)?.ping;
                  if (ping !== void 0) return React.createElement(PingIndicator, { ping, strings });
                  return void 0;
                })(),
              ),
              React.createElement(
                "td",
                { className: "player-name" },
                localPlayer.displayName || localPlayer.name,
              ),
              React.createElement("td", null),
              !singlePlayer && React.createElement("td", null),
              React.createElement(
                "td",
                null,
                !localPlayer.isObserver || localPlayer.defeated ? localPlayer.getUnitsKilled() : void 0,
              ),
            ),
          playerInfos.map((info, idx) =>
            React.createElement(
              "tr",
              {
                key: idx,
                style: {
                  color: info.player.defeated ? "grey" : info.player.color.asHexString(),
                },
              },
              React.createElement(
                "td",
                { className: "player-country" },
                React.createElement(CountryIcon, {
                  country: info.player.country ? info.player.country.name : OBS_COUNTRY_NAME,
                }),
              ),
              React.createElement(
                "td",
                { className: "player-ping" },
                (() => {
                  const found = conInfos?.find((c) => c.name === info.player.name);
                  const ping =
                    found?.status === PlayerConnectionStatus.Connected ? found?.ping : void 0;
                  if (ping !== void 0) return React.createElement(PingIndicator, { ping, strings });
                  return void 0;
                })(),
              ),
              React.createElement(
                "td",
                { className: "player-name" },
                info.player.displayName ||
                  (info.player.isAi
                    ? strings.get(aiUiNames.get(info.player.aiDifficulty) || "NOSTR:AI")
                    : info.player.name),
              ),
              React.createElement(
                "td",
                null,
                (!localPlayer?.isObserver || localPlayer.defeated) &&
                  React.createElement("input", {
                    type: "checkbox",
                    name: "alliance",
                    className:
                      info.alliance?.status === AllianceStatus.Requested
                        ? info.alliance.players.first === localPlayer
                          ? "semi-checked-left"
                          : "semi-checked-right"
                        : void 0,
                    disabled:
                      !alliancesAllowed ||
                      !info.allianceToggleable ||
                      !info.player.isCombatant(),
                    checked: info.alliance?.status === AllianceStatus.Formed,
                    onChange: () =>
                      onToggleAlliance(
                        info.player,
                        !(
                          info.alliance?.status === AllianceStatus.Formed ||
                          (info.alliance?.status === AllianceStatus.Requested &&
                            info.alliance.players.first === localPlayer)
                        ),
                      ),
                  }),
              ),
              !singlePlayer &&
                React.createElement(
                  "td",
                  null,
                  !info.player.isAi &&
                    React.createElement("input", {
                      type: "checkbox",
                      name: "mute",
                      checked: !info.muted,
                      onChange: (e: any) => onToggleChat(info.player, e.target.checked),
                    }),
                ),
              React.createElement(
                "td",
                null,
                !info.player.isObserver || info.player.defeated
                  ? info.player.getUnitsKilled()
                  : void 0,
              ),
            ),
          ),
        ),
      ),
    ),
    React.createElement(
      "div",
      { className: "diplo-form-footer" },
      React.createElement(
        "div",
        { className: "game-settings" },
        React.createElement("div", null, strings.get("TXT_MAP", mapName)),
        React.createElement(
          "div",
          null,
          [
            strings.get("GUI:GameType") + ": " + gameTypeName,
            strings.get("GUI:ShortGame") + ": " + onOff(gameOpts.shortGame),
            strings.get("GUI:CratesAppear") + ": " + onOff(gameOpts.cratesAppear),
            strings.get("GUI:SuperWeaponsAllowed") + ": " + onOff(gameOpts.superWeapons),
            strings.get("GUI:DestroyableBridges") + ": " + onOff(gameOpts.destroyableBridges),
            strings.get("GUI:MultiEngineer") + ": " + onOff(gameOpts.multiEngineer),
            strings.get("GUI:NoDogEngiKills") + ": " + onOff(gameOpts.noDogEngiKills),
            strings.get("GUI:InstantCapture") + ": " + onOff(gameOpts.instantCapture),
            strings.get("GUI:DelayedOils") + ": " + onOff(gameOpts.delayedOils),
          ].join(", "),
        ),
      ),
      !singlePlayer &&
        React.createElement(
          "div",
          { "data-r-tooltip": strings.get("STT:TauntsOn") },
          React.createElement(
            "label",
            null,
            React.createElement("input", {
              type: "checkbox",
              name: "taunts",
              checked: !!taunts,
              disabled: taunts === void 0,
              onChange: (e: any) => onToggleTaunts(e.target.checked),
            }),
            " ",
            React.createElement("span", null, strings.get("GUI:TauntsOn")),
          ),
        ),
      !singlePlayer &&
        messages &&
        chatHistory &&
        localPlayer &&
        React.createElement(
          "div",
          { className: "chat" },
          React.createElement(Chat, {
            localUsername: localPlayer.name,
            messages,
            chatHistory,
            channels: [RECIPIENT_ALL, RECIPIENT_TEAM],
            strings,
            userColors: new Map(
              [localPlayer, ...playerInfos.map((i) => i.player)].map((p) => [
                p.name,
                p.color.asHexString(),
              ]),
            ),
            onSendMessage,
            onCancelMessage,
          }),
        ),
    ),
  );
}
