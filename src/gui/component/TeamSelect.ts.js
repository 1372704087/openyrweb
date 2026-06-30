// === Reconstructed SystemJS module: gui/component/TeamSelect ===
// deps: ["react","gui/component/Select","gui/component/Option","game/gameopts/constants"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/component/TeamSelect",
  ["react", "gui/component/Select", "gui/component/Option", "game/gameopts/constants"],
  function (e, t) {
    "use strict";
    var o, l, c, h, u;
    t && t.id;
    return {
      setters: [
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
      ],
      execute: function () {
        (e("formatTeamId", (u = (e) => String.fromCharCode("A".charCodeAt(0) + e))),
          e("TeamSelect", ({ teamId: e, required: t, disabled: i, maxTeams: r, onSelect: s, strings: a }) => {
            let n = new Array(r).fill(0).map((e, t) => t);
            return o.default.createElement(
              l.Select,
              {
                className: "player-team-select",
                initialValue: "" + e,
                disabled: i,
                tooltip: a.get("STT:HostComboTeam"),
                onSelect: (e) => {
                  s?.(Number(e));
                },
              },
              !t && o.default.createElement(c.Option, { value: "" + h.NO_TEAM_ID, label: a.get("GUI:NoneAsSymbols") }),
              n.map((e) => o.default.createElement(c.Option, { key: e, value: "" + e, label: u(e) })),
            );
          }));
      },
    };
  },
);
