// === Reconstructed SystemJS module: gui/screen/mainMenu/modSel/ModSel ===
// deps: ["react","gui/component/List","gui/screen/mainMenu/modSel/ModDetailsPane"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/mainMenu/modSel/ModSel",
  ["react", "gui/component/List", "gui/screen/mainMenu/modSel/ModDetailsPane"],
  function (e, t) {
    "use strict";
    var o, l, c;
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
      ],
      execute: function () {
        e("ModSel", ({ strings: i, mods: e, activeMod: r, selectedMod: s, onSelectMod: a }) => {
          const n = o.useRef(null);
          return (
            o.useEffect(() => {
              n.current?.scrollIntoView();
            }, []),
            o.default.createElement(
              "div",
              { className: "mod-sel-form" },
              o.default.createElement(
                l.List,
                { title: i.get("GUI:SelectMod"), className: "mod-list" },
                e
                  ? e.map((e) => {
                      var t = e.id === s?.id;
                      return o.default.createElement(
                        l.ListItem,
                        {
                          key: e.id,
                          selected: t,
                          innerRef: t ? n : null,
                          onClick: () => a(e),
                          onDoubleClick: () => a(e, !0),
                          style: { display: "flex" },
                        },
                        o.default.createElement(
                          "div",
                          { className: "mod-name" },
                          (e === r ? "✔ " : "") +
                            e.name +
                            (e.supported ? "" : ` (${i.get("GUI:ModUnsupported").toUpperCase()})`),
                        ),
                      );
                    })
                  : o.default.createElement(l.ListItem, { style: { textAlign: "center" } }, i.get("GUI:LoadingEx")),
              ),
              s &&
                o.default.createElement(c.ModDetailsPane, {
                  modLoaded: r === s,
                  modStatus: s.status,
                  modDetails: s.meta,
                  strings: i,
                }),
            )
          );
        });
      },
    };
  },
);
