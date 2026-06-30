// === Reconstructed SystemJS module: gui/screen/game/gameMenu/ConInfoForm ===
// deps: ["react","gui/component/CountryIcon","game/gameopts/constants","network/gamestate/PlayerConnectionStatus","network/gservConfig","gui/component/Chat"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/gameMenu/ConInfoForm",
  [
    "react",
    "gui/component/CountryIcon",
    "game/gameopts/constants",
    "network/gamestate/PlayerConnectionStatus",
    "network/gservConfig",
    "gui/component/Chat",
  ],
  function (e, t) {
    "use strict";
    var c, h, u, d, g, p;
    t && t.id;
    return {
      setters: [
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
      ],
      execute: function () {
        e(
          "ConInfoForm",
          ({ strings: e, conInfos: i, players: t, localPlayer: r, messages: s, chatHistory: a, onSendMessage: n }) => {
            let [o, l] = c.useState(() =>
              Math.floor((g.TURN_TIMEOUT_MILLIS - g.LAG_STATE_THRESH_MILLIS - g.CON_INFO_THRESH_MILLIS) / 1e3),
            );
            return (
              c.useEffect(() => {
                let e = setInterval(() => l(Math.max(0, o - 1)), 1e3);
                return () => clearInterval(e);
              }, [o]),
              c.default.createElement(
                "div",
                { className: "con-info-form" },
                c.default.createElement(
                  "div",
                  { className: "con-info-form-content" },
                  c.default.createElement(
                    "table",
                    null,
                    c.default.createElement(
                      "thead",
                      null,
                      c.default.createElement(
                        "tr",
                        null,
                        c.default.createElement("th", null),
                        c.default.createElement("th", { className: "player-name" }, e.get("GUI:Player")),
                        c.default.createElement("th", { className: "player-ping" }, e.get("GUI:Ping")),
                        c.default.createElement("th", { className: "player-time" }, e.get("GUI:Time")),
                      ),
                    ),
                    c.default.createElement(
                      "tbody",
                      null,
                      t
                        .filter((e) => !e.isAi)
                        .map((t) => {
                          var e = i?.find((e) => e.name === t.name);
                          return c.default.createElement(
                            "tr",
                            {
                              key: t.name,
                              style: {
                                color: t.color.asHexString(),
                                opacity: e && e.status !== d.PlayerConnectionStatus.Connected ? 0.5 : 1,
                              },
                            },
                            c.default.createElement(
                              "td",
                              null,
                              c.default.createElement(h.CountryIcon, {
                                country: t.country ? t.country.name : u.OBS_COUNTRY_NAME,
                              }),
                            ),
                            c.default.createElement("td", { className: "player-name" }, t.name),
                            c.default.createElement(
                              "td",
                              { className: "player-ping" },
                              c.default.createElement("meter", {
                                value: e?.ping ?? 1e3,
                                max: 1e3,
                                low: 150,
                                high: 500,
                                optimum: 0,
                              }),
                            ),
                            c.default.createElement(
                              "td",
                              { className: "player-time" },
                              e ? Math.floor(e?.lagAllowanceMillis / 1e3) : void 0,
                            ),
                          );
                        }),
                    ),
                  ),
                ),
                c.default.createElement(
                  "div",
                  { className: "con-info-form-footer" },
                  c.default.createElement("div", { className: "time-allowed" }, e.get("TXT_TIME_ALLOWED", o)),
                  c.default.createElement(
                    "div",
                    { className: "chat" },
                    c.default.createElement(p.Chat, {
                      strings: e,
                      messages: s,
                      channels: [g.RECIPIENT_ALL, g.RECIPIENT_TEAM],
                      chatHistory: a,
                      userColors: new Map(t.map((e) => [e.name, e.color.asHexString()])),
                      localUsername: r.name,
                      onSendMessage: n,
                    }),
                  ),
                ),
              )
            );
          },
        );
      },
    };
  },
);
