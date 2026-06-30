// === Reconstructed SystemJS module: game/action/factories/DebugActionFactory ===
// deps: ["game/action/DebugAction"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/action/factories/DebugActionFactory", ["game/action/DebugAction"], function (e, t) {
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
        "DebugActionFactory",
        (r = class {
          constructor(e) {
            this.game = e;
          }
          create() {
            return new i.DebugAction(this.game);
          }
        }),
      );
    },
  };
});
