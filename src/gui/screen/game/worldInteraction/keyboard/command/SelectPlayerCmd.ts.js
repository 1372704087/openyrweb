// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/keyboard/command/SelectPlayerCmd ===
// deps: ["gui/screen/game/worldInteraction/keyboard/command/CenterBaseCmd"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "gui/screen/game/worldInteraction/keyboard/command/SelectPlayerCmd",
  ["gui/screen/game/worldInteraction/keyboard/command/CenterBaseCmd"],
  function (e, t) {
    "use strict";
    var r, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        e(
          "SelectPlayerCmd",
          (i = class {
            constructor(e, t, i, r, s) {
              ((this.playerNum = e),
                (this.player = t),
                (this.mapPanningHelper = i),
                (this.cameraPan = r),
                (this.game = s));
            }
            execute() {
              var e = performance.now();
              let t = !0;
              (!this.lastSelectTime || 400 < e - this.lastSelectTime) && ((t = !1), (this.lastSelectTime = e));
              let i = void 0;
              e = this.game.getCombatants();
              if (
                (this.playerNum < e.length && (i = e[this.playerNum]),
                i && (this.player.value === i || (t && !this.player.value)))
              )
                if (t) {
                  let e = new r.CenterBaseCmd(i, this.game.rules, this.mapPanningHelper, this.cameraPan);
                  e.execute();
                } else i = void 0;
              this.player.value = i;
            }
          }),
        );
      },
    };
  },
);
