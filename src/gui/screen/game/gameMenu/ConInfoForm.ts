/**
 * ConInfoForm — 连接状态表（ping meter + 剩余时间 + 聊天）。
 *
 * 由 gui/screen/game/gameMenu/ConInfoForm.ts.js
 * 重写为 TS（行为完全一致）。
 *
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import * as ReactModule from "react"; // 孪生
import * as CountryIconModule from "gui/component/CountryIcon"; // 孪生
import * as constantsModule from "game/gameopts/constants"; // 孪生
import * as PlayerConnectionStatusModule from "network/gamestate/PlayerConnectionStatus"; // 孪生
import * as gservConfigModule from "network/gservConfig"; // 孪生
import * as ChatModule from "gui/component/Chat"; // 孪生

/* eslint-disable @typescript-eslint/no-explicit-any */

// 孪生 any-shim：react 默认导出在 CJS 命名空间上为 default
const React: any = (ReactModule as any).default ?? ReactModule;
const CountryIcon: any = (CountryIconModule as any).CountryIcon;
const Chat: any = (ChatModule as any).Chat;
const OBS_COUNTRY_NAME: any = (constantsModule as any).OBS_COUNTRY_NAME;
// 孪生这 5 个常量取自 gservConfig（gameopts/constants 里没有，取错会得 undefined → NaN/频道失效）
const TURN_TIMEOUT_MILLIS: any = (gservConfigModule as any).TURN_TIMEOUT_MILLIS;
const LAG_STATE_THRESH_MILLIS: any = (gservConfigModule as any).LAG_STATE_THRESH_MILLIS;
const CON_INFO_THRESH_MILLIS: any = (gservConfigModule as any).CON_INFO_THRESH_MILLIS;
const RECIPIENT_ALL: any = (gservConfigModule as any).RECIPIENT_ALL;
const RECIPIENT_TEAM: any = (gservConfigModule as any).RECIPIENT_TEAM;
const PlayerConnectionStatus: any = (PlayerConnectionStatusModule as any).PlayerConnectionStatus;

/**
 * 连接信息表单。
 * @param props strings/conInfos/players/localPlayer/messages/chatHistory/onSendMessage
 */
export function ConInfoForm(props: {
  strings: any;
  conInfos?: any[];
  players: any[];
  localPlayer: any;
  messages: any[];
  chatHistory: any;
  onSendMessage: (msg: any) => void;
}): any {
  const { strings, conInfos, players, localPlayer, messages, chatHistory, onSendMessage } = props;
  const [secondsLeft, setSecondsLeft] = React.useState(() =>
    Math.floor((TURN_TIMEOUT_MILLIS - LAG_STATE_THRESH_MILLIS - CON_INFO_THRESH_MILLIS) / 1e3),
  );
  React.useEffect(() => {
    const id = setInterval(() => setSecondsLeft(Math.max(0, secondsLeft - 1)), 1e3);
    return () => clearInterval(id);
  }, [secondsLeft]);
  return React.createElement(
    "div",
    { className: "con-info-form" },
    React.createElement(
      "div",
      { className: "con-info-form-content" },
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
            React.createElement("th", { className: "player-name" }, strings.get("GUI:Player")),
            React.createElement("th", { className: "player-ping" }, strings.get("GUI:Ping")),
            React.createElement("th", { className: "player-time" }, strings.get("GUI:Time")),
          ),
        ),
        React.createElement(
          "tbody",
          null,
          players
            .filter((p) => !p.isAi)
            .map((p) => {
              const info = conInfos?.find((i) => i.name === p.name);
              return React.createElement(
                "tr",
                {
                  key: p.name,
                  style: {
                    color: p.color.asHexString(),
                    opacity: info && info.status !== PlayerConnectionStatus.Connected ? 0.5 : 1,
                  },
                },
                React.createElement(
                  "td",
                  null,
                  React.createElement(CountryIcon, {
                    country: p.country ? p.country.name : OBS_COUNTRY_NAME,
                  }),
                ),
                React.createElement("td", { className: "player-name" }, p.name),
                React.createElement(
                  "td",
                  { className: "player-ping" },
                  React.createElement("meter", {
                    value: info?.ping ?? 1e3,
                    max: 1e3,
                    low: 150,
                    high: 500,
                    optimum: 0,
                  }),
                ),
                React.createElement(
                  "td",
                  { className: "player-time" },
                  info ? Math.floor(info?.lagAllowanceMillis / 1e3) : void 0,
                ),
              );
            }),
        ),
      ),
    ),
    React.createElement(
      "div",
      { className: "con-info-form-footer" },
      React.createElement("div", { className: "time-allowed" }, strings.get("TXT_TIME_ALLOWED", secondsLeft)),
      React.createElement(
        "div",
        { className: "chat" },
        React.createElement(Chat, {
          strings,
          messages,
          channels: [RECIPIENT_ALL, RECIPIENT_TEAM],
          chatHistory,
          userColors: new Map(players.map((p) => [p.name, p.color.asHexString()])),
          localUsername: localPlayer.name,
          onSendMessage,
        }),
      ),
    ),
  );
}
