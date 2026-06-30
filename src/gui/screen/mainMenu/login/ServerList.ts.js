// === Reconstructed SystemJS module: gui/screen/mainMenu/login/ServerList ===
// deps: ["gui/component/List","react"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/mainMenu/login/ServerList", ["gui/component/List", "react"], function (e, t) {
  "use strict";
  var o, l;
  t && t.id;
  return {
    setters: [
      function (e) {
        o = e;
      },
      function (e) {
        l = e;
      },
    ],
    execute: function () {
      e("ServerList", ({ regionId: r, regions: e, pings: s, strings: a, onChange: n }) =>
        l.default.createElement(
          o.List,
          { className: "server-list" },
          e.map((e) => {
            var t = s.get(e);
            let i = !e.available || (s.has(e) && void 0 === t);
            return l.default.createElement(
              o.ListItem,
              { key: e.id, selected: e.id === r && !i, disabled: i, onClick: () => !i && n(e.id) },
              l.default.createElement("span", { className: "label" }, e.label),
              l.default.createElement(
                "span",
                { className: "ping" },
                i
                  ? l.default.createElement("span", { className: "offline-text" }, a.get("TS:ServerOffline"))
                  : void 0 !== t &&
                      l.default.createElement("span", { className: "online-text" }, a.get("TS:ServerOnline")),
              ),
            );
          }),
        ),
      );
    },
  };
});
