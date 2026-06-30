// === Reconstructed SystemJS module: game/action/factories/DropPlayerActionFactory ===
// deps: ["game/action/DropPlayerAction"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/action/factories/DropPlayerActionFactory", ["game/action/DropPlayerAction"], function (e, t) {
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
        "DropPlayerActionFactory",
        (r = class {
          constructor(e, t) {
            ((this.game = e), (this.localPlayerName = t));
          }
          create() {
            return new i.DropPlayerAction(this.game, this.localPlayerName);
          }
        }),
      );
    },
  };
});
