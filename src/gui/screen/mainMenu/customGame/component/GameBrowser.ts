/**
 * GameBrowser — 自定义游戏浏览器（房间列表 + 聊天 + 玩家列表）。
 *
 * 由 gui/screen/mainMenu/customGame/component/GameBrowser.ts.js
 * 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标。
 */
import React, { useEffect, useState } from "react"; // 孪生（react 外部依赖）
import { Chat } from "gui/component/Chat"; // 已转换
import {
  List,
  ListHeader,
  ListItem,
} from "gui/component/List"; // 已转换
import { Image } from "gui/component/Image"; // 已转换
import { RankIndicator } from "gui/screen/mainMenu/lobby/component/RankIndicator"; // 孪生（本组内一并转换）
import { ChannelUser } from "gui/component/ChannelUser"; // 已转换
import { ChatRecipientType } from "network/chat/ChatMessage"; // 已转换

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 房间列表条目。 */
const GamesList = ({
  games,
  selectedGame,
  onClickGame,
  onDoubleClickGame,
  tooltip,
  strings: strings,
  playerProfiles,
  mapList,
}: any) =>
  React.createElement(
    React.Fragment,
    null,
    React.createElement(
      ListHeader,
      { className: "game game-list-header" },
      React.createElement(
        "span",
        { className: "game-flags" },
        React.createElement("span", { className: "game-type" }),
        React.createElement("span", { className: "game-pass-locked" }),
        React.createElement("span", { className: "game-obs" }),
      ),
      React.createElement(
        "span",
        { className: "game-map" },
        strings.get("GUI:Map"),
      ),
      React.createElement(
        "span",
        { className: "game-name" },
        strings.get("GUI:RoomDesc"),
      ),
      React.createElement("span", { className: "game-players" }, "👤"),
      React.createElement(
        "span",
        { className: "game-host" },
        strings.get("GUI:HostName"),
      ),
      React.createElement(
        "span",
        { className: "game-ping" },
        strings.get("GUI:Ping"),
      ),
    ),
    React.createElement(
      List,
      { className: "games-list", tooltip },
      games.map((game: any) => {
        var ping = game.hostPing;
        var profile = playerProfiles.get(game.hostName);
        let mapMeta = mapList.getByName(game.mapName);
        var uiMap =
          !mapMeta?.official && game.hostMuted
            ? strings.get("GUI:CustomMap")
            : mapMeta?.getFullMapTitle(strings) || game.mapName;
        return React.createElement(GameRow, {
          key: game.name,
          game,
          uiMapName: uiMap,
          customMap: !mapMeta?.official,
          ping,
          hostProfile: profile,
          tooltip: [
            ...(game.modName
              ? ["" + strings.get("GUI:GameMod", game.modName)]
              : []),
            strings.get("TXT_MAP", uiMap),
            ping
              ? strings.get("WOL:GamePing", ping)
              : strings.get("TXT_UNKNOWN_PING"),
            ...(void 0 !== profile?.rank
              ? [strings.get("TXT_HOST_RANK") + " " + profile.rank]
              : []),
          ].join(", "),
          selected: game.name === selectedGame?.name,
          strings: strings,
          onClick: onClickGame,
          onDoubleClick: onDoubleClickGame,
        });
      }),
    ),
  );

/** 单行房间。 */
const GameRow = ({
  game,
  uiMapName,
  customMap,
  selected,
  tooltip,
  ping,
  hostProfile,
  strings: strings,
  onClick,
  onDoubleClick,
}: any) =>
  React.createElement(
    ListItem,
    {
      key: game.name,
      className: "game",
      selected,
      tooltip,
      onClick: () => onClick(game),
      onDoubleClick: () => onDoubleClick(game),
    },
    React.createElement(
      "span",
      { className: "game-flags" },
      React.createElement(
        "span",
        {
          className: "game-type",
          title:
            game.modName || !customMap
              ? "" +
                strings.get(
                  "GUI:GameMod",
                  game.modName || strings.get("GUI:Official"),
                )
              : "" + strings.get("GUI:CustomMap"),
        },
        game.modName || customMap
          ? React.createElement(Image, { src: "settings.png" })
          : React.createElement(Image, {
              src: game.tournament ? "woltrny.pcx" : "gt18.pcx",
            }),
      ),
      React.createElement(
        "span",
        { className: "game-pass-locked" },
        game.passLocked
          ? React.createElement(Image, { src: "wolpriv.pcx" })
          : null,
      ),
      React.createElement(
        "span",
        { className: "game-obs" },
        game.observable
          ? React.createElement(Image, { src: "wolob.pcx" })
          : null,
      ),
    ),
    React.createElement(
      "span",
      { className: "game-map", title: uiMapName },
      uiMapName,
    ),
    React.createElement(
      "span",
      {
        className: "game-name",
        title: game.hostMuted ? void 0 : game.description,
      },
      game.hostMuted ? void 0 : game.description,
    ),
    React.createElement(
      "span",
      { className: "game-players" },
      game.maxPlayers
        ? game.humanPlayers +
          game.aiPlayers +
          "/" +
          (game.maxPlayers - (game.observable ? 1 : 0))
        : "?/?",
    ),
    React.createElement(
      "span",
      { className: "game-host" },
      game.hostName,
      void 0 !== hostProfile &&
        React.createElement(RankIndicator, {
          playerProfile: hostProfile,
          strings: strings,
        }),
    ),
    React.createElement(
      "span",
      { className: "game-ping" },
      ping
        ? React.createElement("meter", {
            value: ping,
            max: 300,
            low: 100,
            high: 250,
            optimum: 0,
            title: ping + "ms",
          })
        : null,
    ),
  );

/** 组件 props。 */
export type GameBrowserProps = any;

/** 游戏浏览器主视图。 */
export const GameBrowser = (props: GameBrowserProps) => {
  const [selected, setSelected] = useState<any>(void 0);
  const playerMenu = [
    {
      label: props.strings.get("GUI:PlayerMenuMessage"),
      onClick: (user: any) => {
        props.chatHistory.lastComposeTarget.value = {
          type: ChatRecipientType.Whisper,
          name: user.name,
        };
      },
    },
  ];
  useEffect(() => {
    if (selected && !props.games.find((g: any) => g.name === selected.name))
      applySelected(void 0);
  }, [props.games]);
  const applySelected = (game: any) => {
    setSelected(game);
    props.onSelectGame(game);
  };
  let strings = props.strings;
  return React.createElement(
    "div",
    { className: "gamebrowser-wrapper" },
    React.createElement(
      "div",
      { className: "gamebrowser-top" },
      React.createElement(
        "div",
        { className: "games" },
        React.createElement(
          "div",
          { className: "games-header" },
          React.createElement("button", {
            className: "icon-button refresh-button",
            onClick: props.onRefreshClick,
            "data-r-tooltip": strings.get("STT:WOLLobbyRefreshChannels"),
          }),
          React.createElement(
            "span",
            { className: "games-label" },
            strings.get("GUI:OpenGames"),
          ),
        ),
        React.createElement(GamesList, {
          games: props.games,
          selectedGame: selected,
          mapList: props.mapList,
          onClickGame: applySelected,
          onDoubleClickGame: (game: any) => {
            applySelected(game);
            props.onDoubleClickGame(game);
          },
          tooltip: strings.get("STT:LobbyListGames"),
          strings,
          playerProfiles: props.playerProfiles,
        }),
      ),
    ),
    React.createElement(
      "div",
      { className: "gamebrowser-bottom" },
      React.createElement(Chat, {
        strings,
        messages: props.messages,
        channels: props.channels ?? [],
        chatHistory: props.chatHistory,
        localUsername: props.localUsername,
        onSendMessage: props.onSendMessage,
        tooltips: {
          input: strings.get("STT:LobbyEditInput"),
          output: strings.get("STT:LobbyEditOutput"),
          button: strings.get("STT:EmoteButton"),
        },
      }),
      React.createElement(
        List,
        {
          className: "players-list",
          tooltip: strings.get("STT:LobbyListUsers"),
        },
        props.users.map((user: any) => {
          var profile = props.playerProfiles.get(user.name);
          return React.createElement(ChannelUser, {
            key: user.name,
            user,
            playerProfile: profile,
            strings,
            localUsername: props.localUsername,
            menuItems: playerMenu,
          });
        }),
      ),
    ),
  );
};
