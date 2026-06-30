// === Reconstructed SystemJS module: gui/screen/game/gameMenu/DiploForm ===
// deps: ["react","game/Alliances","game/gameopts/constants","gui/component/CountryIcon","gui/component/Chat","network/gservConfig","gui/component/PingIndicator","network/gamestate/PlayerConnectionStatus"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/gameMenu/DiploForm",
  [
    "react",
    "game/Alliances",
    "game/gameopts/constants",
    "gui/component/CountryIcon",
    "gui/component/Chat",
    "network/gservConfig",
    "gui/component/PingIndicator",
    "network/gamestate/PlayerConnectionStatus",
  ],
  function (e, t) {
    "use strict";
    var b, S, w, E, C, x, O, A;
    t && t.id;
    return {
      setters: [
        function (e) {
          b = e;
        },
        function (e) {
          S = e;
        },
        function (e) {
          w = e;
        },
        function (e) {
          E = e;
        },
        function (e) {
          C = e;
        },
        function (e) {
          x = e;
        },
        function (e) {
          O = e;
        },
        function (e) {
          A = e;
        },
      ],
      execute: function () {
        e(
          "DiploForm",
          ({
            strings: i,
            playerInfos: e,
            localPlayer: r,
            taunts: t,
            singlePlayer: s,
            alliancesAllowed: a,
            gameModes: n,
            gameOpts: o,
            mapName: l,
            messages: c,
            chatHistory: h,
            conInfos: u,
            onToggleTaunts: d,
            onToggleAlliance: g,
            onToggleChat: p,
            onSendMessage: m,
            onCancelMessage: f,
          }) => {
            var y,
              T = i.get(n.getById(o.gameMode).label),
              v = (e) => (e ? i.get("TXT_ON") : i.get("TXT_OFF"));
            return b.default.createElement(
              "div",
              { className: "diplo-form" },
              b.default.createElement(
                "div",
                { className: "players" },
                b.default.createElement(
                  "table",
                  null,
                  b.default.createElement(
                    "thead",
                    null,
                    b.default.createElement(
                      "tr",
                      null,
                      b.default.createElement("th", { className: "player-country" }),
                      b.default.createElement("th", { className: "player-ping" }),
                      b.default.createElement("th", { className: "player-name" }, i.get("GUI:Player")),
                      b.default.createElement("th", null, i.get("GUI:Allies")),
                      !s && b.default.createElement("th", null, i.get("GUI:Chat")),
                      b.default.createElement("th", null, i.get("GUI:Kills")),
                    ),
                  ),
                  b.default.createElement(
                    "tbody",
                    null,
                    r &&
                      b.default.createElement(
                        "tr",
                        { style: { color: r.defeated ? "grey" : r.color.asHexString() } },
                        b.default.createElement(
                          "td",
                          { className: "player-country" },
                          b.default.createElement(E.CountryIcon, {
                            country: r.country ? r.country.name : w.OBS_COUNTRY_NAME,
                          }),
                        ),
                        b.default.createElement(
                          "td",
                          { className: "player-ping" },
                          void 0 !== (y = u?.find((e) => e.name === r.name)?.ping) &&
                            b.default.createElement(O.PingIndicator, { ping: y, strings: i }),
                        ),
                        b.default.createElement("td", { className: "player-name" }, r.name),
                        b.default.createElement("td", null),
                        !s && b.default.createElement("td", null),
                        b.default.createElement("td", null, !r.isObserver || r.defeated ? r.getUnitsKilled() : void 0),
                      ),
                    e.map((t, e) =>
                      b.default.createElement(
                        "tr",
                        { key: e, style: { color: t.player.defeated ? "grey" : t.player.color.asHexString() } },
                        b.default.createElement(
                          "td",
                          { className: "player-country" },
                          b.default.createElement(E.CountryIcon, {
                            country: t.player.country ? t.player.country.name : w.OBS_COUNTRY_NAME,
                          }),
                        ),
                        b.default.createElement(
                          "td",
                          { className: "player-ping" },
                          (() => {
                            var e = u?.find((e) => e.name === t.player.name),
                              e = e?.status === A.PlayerConnectionStatus.Connected ? e?.ping : void 0;
                            return void 0 !== e && b.default.createElement(O.PingIndicator, { ping: e, strings: i });
                          })(),
                        ),
                        b.default.createElement(
                          "td",
                          { className: "player-name" },
                          t.player.isAi ? i.get(w.aiUiNames.get(t.player.aiDifficulty)) : t.player.name,
                        ),
                        b.default.createElement(
                          "td",
                          null,
                          (!r?.isObserver || r.defeated) &&
                            b.default.createElement("input", {
                              type: "checkbox",
                              name: "alliance",
                              className:
                                t.alliance?.status === S.AllianceStatus.Requested
                                  ? t.alliance.players.first === r
                                    ? "semi-checked-left"
                                    : "semi-checked-right"
                                  : void 0,
                              disabled: !a || !t.allianceToggleable || !t.player.isCombatant(),
                              checked: t.alliance?.status === S.AllianceStatus.Formed,
                              onChange: () =>
                                g(
                                  t.player,
                                  !(
                                    t.alliance?.status === S.AllianceStatus.Formed ||
                                    (t.alliance?.status === S.AllianceStatus.Requested &&
                                      t.alliance.players.first === r)
                                  ),
                                ),
                            }),
                        ),
                        !s &&
                          b.default.createElement(
                            "td",
                            null,
                            !t.player.isAi &&
                              b.default.createElement("input", {
                                type: "checkbox",
                                name: "mute",
                                checked: !t.muted,
                                onChange: (e) => p(t.player, e.target.checked),
                              }),
                          ),
                        b.default.createElement(
                          "td",
                          null,
                          !t.player.isObserver || t.player.defeated ? t.player.getUnitsKilled() : void 0,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              b.default.createElement(
                "div",
                { className: "diplo-form-footer" },
                b.default.createElement(
                  "div",
                  { className: "game-settings" },
                  b.default.createElement("div", null, i.get("TXT_MAP", l)),
                  b.default.createElement(
                    "div",
                    null,
                    [
                      i.get("GUI:GameType") + ": " + T,
                      i.get("GUI:ShortGame") + ": " + v(o.shortGame),
                      i.get("GUI:CratesAppear") + ": " + v(o.cratesAppear),
                      i.get("GUI:SuperWeaponsAllowed") + ": " + v(o.superWeapons),
                      i.get("GUI:DestroyableBridges") + ": " + v(o.destroyableBridges),
                      i.get("GUI:MultiEngineer") + ": " + v(o.multiEngineer),
                      i.get("GUI:NoDogEngiKills") + ": " + v(o.noDogEngiKills),
                      i.get("GUI:InstantCapture") + ": " + v(o.instantCapture),
                      i.get("GUI:DelayedOils") + ": " + v(o.delayedOils),
                    ].join(", "),
                  ),
                ),
                !s &&
                  b.default.createElement(
                    "div",
                    { "data-r-tooltip": i.get("STT:TauntsOn") },
                    b.default.createElement(
                      "label",
                      null,
                      b.default.createElement("input", {
                        type: "checkbox",
                        name: "taunts",
                        checked: !!t,
                        disabled: void 0 === t,
                        onChange: (e) => d(e.target.checked),
                      }),
                      " ",
                      b.default.createElement("span", null, i.get("GUI:TauntsOn")),
                    ),
                  ),
                !s &&
                  c &&
                  h &&
                  r &&
                  b.default.createElement(
                    "div",
                    { className: "chat" },
                    b.default.createElement(C.Chat, {
                      localUsername: r.name,
                      messages: c,
                      chatHistory: h,
                      channels: [x.RECIPIENT_ALL, x.RECIPIENT_TEAM],
                      strings: i,
                      userColors: new Map([r, ...e.map((e) => e.player)].map((e) => [e.name, e.color.asHexString()])),
                      onSendMessage: m,
                      onCancelMessage: f,
                    }),
                  ),
              ),
            );
          },
        );
      },
    };
  },
);
