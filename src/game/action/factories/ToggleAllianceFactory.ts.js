// === Reconstructed SystemJS module: game/action/factories/ToggleAllianceFactory ===
// deps: ["game/action/ToggleAllianceAction"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/action/factories/ToggleAllianceFactory", ["game/action/ToggleAllianceAction"], function (e, t) {
  "use strict";
  var i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      e(
        "ToggleAllianceActionFactory",
        (r = class {
          constructor(e) {
            this.game = e;
          }
          create() {
            return new i.ToggleAllianceAction(this.game);
          }
        }),
      );
    },
  };
});
