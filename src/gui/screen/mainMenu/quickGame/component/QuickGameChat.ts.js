// === Reconstructed SystemJS module: gui/screen/mainMenu/quickGame/component/QuickGameChat ===
// deps: ["react","gui/component/Chat","gui/component/List","gui/component/ChannelUser","network/chat/ChatMessage"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/quickGame/component/QuickGameChat",
  ["react", "gui/component/Chat", "gui/component/List", "gui/component/ChannelUser", "network/chat/ChatMessage"],
  function (e, t) {
    "use strict";
    var h, u, d, g, p;
    t && t.id;
    return {
      setters: [
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
          "QuickGameChat",
          ({
            strings: i,
            messages: e,
            channels: t,
            localUsername: r,
            users: s,
            chatHistory: a,
            playerProfiles: n,
            onSendMessage: o,
            onInviteToTeam: l,
          }) => {
            const c = [
              {
                label: i.get("GUI:PlayerMenuMessage"),
                onClick: (e) => {
                  a.lastComposeTarget.value = { type: p.ChatRecipientType.Whisper, name: e.name };
                },
              },
            ];
            return (
              l && c.push({ label: i.get("GUI:PlayerMenuInvite"), onClick: l }),
              h.default.createElement(
                h.default.Fragment,
                null,
                h.default.createElement(u.Chat, {
                  strings: i,
                  messages: e,
                  channels: t ?? [],
                  chatHistory: a,
                  localUsername: r,
                  onSendMessage: o,
                  tooltips: {
                    input: i.get("STT:LobbyEditInput"),
                    output: i.get("STT:LobbyEditOutput"),
                    button: i.get("STT:EmoteButton"),
                  },
                }),
                h.default.createElement(
                  d.List,
                  { className: "players-list", tooltip: i.get("STT:LobbyListUsers") },
                  s.map((e) => {
                    var t = n.get(e.name);
                    return h.default.createElement(g.ChannelUser, {
                      key: e.name,
                      user: e,
                      playerProfile: t,
                      strings: i,
                      localUsername: r,
                      menuItems: c,
                    });
                  }),
                ),
              )
            );
          },
        );
      },
    };
  },
);
