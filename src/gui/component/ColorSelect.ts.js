// === Reconstructed SystemJS module: gui/component/ColorSelect ===
// deps: ["react","classnames","gui/component/Select","gui/component/Option"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/component/ColorSelect",
  ["react", "classnames", "gui/component/Select", "gui/component/Option"],
  function (e, t) {
    "use strict";
    var o, l, c, h;
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
        e("ColorSelect", ({ color: e, disabled: t, availableColors: i, onSelect: r, strings: s }) => {
          let [a, n] = o.useState(() => e);
          o.useEffect(() => {
            a !== e && n(e);
          }, [e]);
          return o.default.createElement(
            c.Select,
            {
              className: l.default("player-color-select", { "bg-color": !!a }),
              tooltip: s.get("STT:HostComboColor"),
              initialValue: a || "random",
              disabled: t,
              labelStyle: (e) => {
                return { backgroundColor: "random" !== e ? e : "transparent" };
              },
              onSelect: (e) => {
                ("random" === e && (e = ""), n(e), r?.(e));
              },
            },
            (t ? [a] : i).map((e) =>
              o.default.createElement(h.Option, {
                key: e,
                value: e || "random",
                label: e ? "" : s.get("GUI:RandomAsSymbols"),
                className: l.default({ "bg-color": !!e }),
              }),
            ),
          );
        });
      },
    };
  },
);
