// === Reconstructed SystemJS module: gui/component/ChannelUser ===
// deps: ["classnames","gui/screen/mainMenu/lobby/component/RankIndicator","react","gui/component/ChannelOpIndicator","gui/component/PlayerContextMenu"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/component/ChannelUser",
  [
    "classnames",
    "gui/screen/mainMenu/lobby/component/RankIndicator",
    "react",
    "gui/component/ChannelOpIndicator",
    "gui/component/PlayerContextMenu",
  ],
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
        e("ChannelUser", ({ user: t, playerProfile: e, strings: i, menuItems: r, localUsername: s }) => {
          const [a, n] = d.default.useState(!1),
            o = t.name === s;
          let l = t.name;
          (t.operator && (l += " : " + i.get("TXT_OPER")),
            (l += void 0 !== e?.rank ? " : " + i.get(u.RANK_LABELS.get(e.rankType)) : " : " + i.get("TXT_UNRANKED")));
          var c = r.map((e) => ({
            label: e.label,
            onClick: () => {
              (e.onClick(t), n(!1));
            },
          }));
          return d.default.createElement(
            "div",
            {
              className: h.default("player", { operator: t.operator, "menu-open": a }),
              "data-r-tooltip": l,
              onClick: (e) => {
                (e.preventDefault(), e.stopPropagation(), o || n(!0));
              },
              onContextMenu: (e) => {
                (e.preventDefault(), e.stopPropagation(), o || n(!0));
              },
            },
            d.default.createElement(g.ChannelOpIndicator, { operator: t.operator }),
            d.default.createElement(u.RankIndicator, { playerProfile: e, strings: i }),
            d.default.createElement(
              "span",
              { className: "player-name-wrapper" },
              d.default.createElement("span", { className: "player-name" }, t.name),
              !o &&
                0 < c.length &&
                d.default.createElement(
                  d.default.Fragment,
                  null,
                  d.default.createElement("span", { className: "player-menu-icon" }, "▼"),
                  a && d.default.createElement(p.PlayerContextMenu, { items: c, onClose: () => n(!1) }),
                ),
            ),
          );
        });
      },
    };
  },
);
