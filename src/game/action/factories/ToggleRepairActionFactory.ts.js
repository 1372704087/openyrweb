// === Reconstructed SystemJS module: game/action/factories/ToggleRepairActionFactory ===
// deps: ["game/action/ToggleRepairAction"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/action/factories/ToggleRepairActionFactory", ["game/action/ToggleRepairAction"], function (e, t) {
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
        "ToggleRepairActionFactory",
        (r = class {
          constructor(e) {
            this.game = e;
          }
          create() {
            return new i.ToggleRepairAction(this.game);
          }
        }),
      );
    },
  };
});
