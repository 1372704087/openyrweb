// === Reconstructed SystemJS module: gui/screen/game/component/hud/commandBar/CommandBarButtonList ===
// deps: ["gui/screen/game/component/hud/commandBar/CommandBarButtonType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/component/hud/commandBar/CommandBarButtonList",
  ["gui/screen/game/component/hud/commandBar/CommandBarButtonType"],
  function (e, t) {
    "use strict";
    var a, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
      ],
      execute: function () {
        e(
          "CommandBarButtonList",
          (i = class {
            constructor() {
              this.buttons = [];
            }
            fromIni(e) {
              var t,
                i = (e.getString("ButtonList") || void 0)?.split(",") ?? [];
              let r = [],
                s = new Set(Object.keys(a.CommandBarButtonType).filter((e) => "string" == typeof e));
              for (t of i)
                "x" === t
                  ? r.push(a.CommandBarButtonType.Separator)
                  : s.has(t)
                    ? r.push(a.CommandBarButtonType[t])
                    : console.warn(`Unknown command bar button type "${t}"`);
              return ((this.buttons = r), this);
            }
          }),
        );
      },
    };
  },
);
