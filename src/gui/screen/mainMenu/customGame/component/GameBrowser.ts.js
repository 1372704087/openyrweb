// === Reconstructed SystemJS module: gui/screen/mainMenu/customGame/component/GameBrowser ===
// deps: ["react","gui/component/Chat","gui/component/List","gui/component/Image","gui/screen/mainMenu/lobby/component/RankIndicator","gui/component/ChannelUser","network/chat/ChatMessage"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/customGame/component/GameBrowser",
  [
    "react",
    "gui/component/Chat",
    "gui/component/List",
    "gui/component/Image",
    "gui/screen/mainMenu/lobby/component/RankIndicator",
    "gui/component/ChannelUser",
    "network/chat/ChatMessage",
  ],
  function (e, t) {
    "use strict";
    var g, o, p, h, u, l, c, d, m;
    t && t.id;
    return {
      setters: [
        function (e) {
          g = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
      ],
      execute: function () {
        (e("GameBrowser", (i) => {
          const [t, r] = g.useState(void 0),
            s = [
              {
                label: i.strings.get("GUI:PlayerMenuMessage"),
                onClick: (e) => {
                  i.chatHistory.lastComposeTarget.value = { type: c.ChatRecipientType.Whisper, name: e.name };
                },
              },
            ];
          g.useEffect(() => {
            t && !i.games.find((e) => e.name === t.name) && a(void 0);
          }, [i.games]);
          const a = (e) => {
            (r(e), i.onSelectGame(e));
          };
          let n = i.strings;
          return g.default.createElement(
            "div",
            { className: "gamebrowser-wrapper" },
            g.default.createElement(
              "div",
              { className: "gamebrowser-top" },
              g.default.createElement(
                "div",
                { className: "games" },
                g.default.createElement(
                  "div",
                  { className: "games-header" },
                  g.default.createElement("button", {
                    className: "icon-button refresh-button",
                    onClick: i.onRefreshClick,
                    "data-r-tooltip": n.get("STT:WOLLobbyRefreshChannels"),
                  }),
                  g.default.createElement("span", { className: "games-label" }, n.get("GUI:OpenGames")),
                ),
                g.default.createElement(d, {
                  games: i.games,
                  selectedGame: t,
                  mapList: i.mapList,
                  onClickGame: a,
                  onDoubleClickGame: (e) => {
                    (a(e), i.onDoubleClickGame(e));
                  },
                  tooltip: n.get("STT:LobbyListGames"),
                  strings: n,
                  playerProfiles: i.playerProfiles,
                }),
              ),
            ),
            g.default.createElement(
              "div",
              { className: "gamebrowser-bottom" },
              g.default.createElement(o.Chat, {
                strings: n,
                messages: i.messages,
                channels: i.channels ?? [],
                chatHistory: i.chatHistory,
                localUsername: i.localUsername,
                onSendMessage: i.onSendMessage,
                tooltips: {
                  input: n.get("STT:LobbyEditInput"),
                  output: n.get("STT:LobbyEditOutput"),
                  button: n.get("STT:EmoteButton"),
                },
              }),
              g.default.createElement(
                p.List,
                { className: "players-list", tooltip: n.get("STT:LobbyListUsers") },
                i.users.map((e) => {
                  var t = i.playerProfiles.get(e.name);
                  return g.default.createElement(l.ChannelUser, {
                    key: e.name,
                    user: e,
                    playerProfile: t,
                    strings: n,
                    localUsername: i.localUsername,
                    menuItems: s,
                  });
                }),
              ),
            ),
          );
        }),
          (d = ({
            games: e,
            selectedGame: o,
            onClickGame: l,
            onDoubleClickGame: c,
            tooltip: t,
            strings: h,
            playerProfiles: u,
            mapList: d,
          }) =>
            g.default.createElement(
              g.default.Fragment,
              null,
              g.default.createElement(
                p.ListHeader,
                { className: "game game-list-header" },
                g.default.createElement(
                  "span",
                  { className: "game-flags" },
                  g.default.createElement("span", { className: "game-type" }),
                  g.default.createElement("span", { className: "game-pass-locked" }),
                  g.default.createElement("span", { className: "game-obs" }),
                ),
                g.default.createElement("span", { className: "game-map" }, h.get("GUI:Map")),
                g.default.createElement("span", { className: "game-name" }, h.get("GUI:RoomDesc")),
                g.default.createElement("span", { className: "game-players" }, "👤"),
                g.default.createElement("span", { className: "game-host" }, h.get("GUI:HostName")),
                g.default.createElement("span", { className: "game-ping" }, h.get("GUI:Ping")),
              ),
              g.default.createElement(
                p.List,
                { className: "games-list", tooltip: t },
                e.map((e, t) => {
                  var i = e.hostPing,
                    r = u.get(e.hostName),
                    s = r?.rank;
                  let a = d.getByName(e.mapName);
                  var n = !a?.official && e.hostMuted ? h.get("GUI:CustomMap") : a?.getFullMapTitle(h) || e.mapName;
                  return g.default.createElement(m, {
                    key: e.name,
                    game: e,
                    uiMapName: n,
                    customMap: !a?.official,
                    ping: i,
                    hostProfile: r,
                    tooltip: [
                      ...(e.modName ? ["" + h.get("GUI:GameMod", e.modName)] : []),
                      h.get("TXT_MAP", n),
                      i ? h.get("WOL:GamePing", i) : h.get("TXT_UNKNOWN_PING"),
                      ...(void 0 !== s ? [h.get("TXT_HOST_RANK") + " " + s] : []),
                    ].join(", "),
                    selected: e.name === o?.name,
                    strings: h,
                    onClick: l,
                    onDoubleClick: c,
                  });
                }),
              ),
            )),
          (m = ({
            game: e,
            uiMapName: t,
            customMap: i,
            selected: r,
            tooltip: s,
            ping: a,
            hostProfile: n,
            strings: o,
            onClick: l,
            onDoubleClick: c,
          }) =>
            g.default.createElement(
              p.ListItem,
              {
                key: e.name,
                className: "game",
                selected: r,
                tooltip: s,
                onClick: () => l(e),
                onDoubleClick: () => c(e),
              },
              g.default.createElement(
                "span",
                { className: "game-flags" },
                g.default.createElement(
                  "span",
                  {
                    className: "game-type",
                    title:
                      e.modName || !i
                        ? "" + o.get("GUI:GameMod", e.modName || o.get("GUI:Official"))
                        : "" + o.get("GUI:CustomMap"),
                  },
                  e.modName || i
                    ? g.default.createElement(h.Image, { src: "settings.png" })
                    : g.default.createElement(h.Image, { src: e.tournament ? "woltrny.pcx" : "gt18.pcx" }),
                ),
                g.default.createElement(
                  "span",
                  { className: "game-pass-locked" },
                  e.passLocked ? g.default.createElement(h.Image, { src: "wolpriv.pcx" }) : null,
                ),
                g.default.createElement(
                  "span",
                  { className: "game-obs" },
                  e.observable ? g.default.createElement(h.Image, { src: "wolob.pcx" }) : null,
                ),
              ),
              g.default.createElement("span", { className: "game-map", title: t }, t),
              g.default.createElement(
                "span",
                { className: "game-name", title: e.hostMuted ? void 0 : e.description },
                e.hostMuted ? void 0 : e.description,
              ),
              g.default.createElement(
                "span",
                { className: "game-players" },
                e.maxPlayers ? e.humanPlayers + e.aiPlayers + "/" + (e.maxPlayers - (e.observable ? 1 : 0)) : "?/?",
              ),
              g.default.createElement(
                "span",
                { className: "game-host" },
                e.hostName,
                void 0 !== n && g.default.createElement(u.RankIndicator, { playerProfile: n, strings: o }),
              ),
              g.default.createElement(
                "span",
                { className: "game-ping" },
                a
                  ? g.default.createElement("meter", {
                      value: a,
                      max: 300,
                      low: 100,
                      high: 250,
                      optimum: 0,
                      title: a + "ms",
                    })
                  : null,
              ),
            )));
      },
    };
  },
);
