// === Reconstructed SystemJS module: gui/component/StartPosSelect ===
// deps: ["react","gui/component/Select","game/gameopts/constants","gui/component/Option"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/component/StartPosSelect",
  ["react", "gui/component/Select", "game/gameopts/constants", "gui/component/Option"],
  function (e, t) {
    "use strict";
    var n, o, l, c;
    t && t.id;
    return {
      setters: [
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
      ],
      execute: function () {
        e("StartPosSelect", ({ startPos: e, disabled: t, availableStartPositions: i, onSelect: r, strings: s }) => {
          let a = [...new Set([e, ...i]).values()].sort();
          return n.default.createElement(
            o.Select,
            {
              className: "player-start-pos-select",
              initialValue: "" + e,
              disabled: t,
              tooltip: s.get("STT:HostComboStart"),
              onSelect: (e) => {
                r?.(Number(e));
              },
            },
            a.map((e) =>
              n.default.createElement(c.Option, {
                key: e,
                value: "" + e,
                label: e === l.RANDOM_START_POS ? s.get("GUI:RandomAsSymbols") : "" + (e + 1),
              }),
            ),
          );
        });
      },
    };
  },
);
