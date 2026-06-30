// === Reconstructed SystemJS module: game/action/factories/ResignGameActionFactory ===
// deps: ["game/action/ResignGameAction"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/action/factories/ResignGameActionFactory", ["game/action/ResignGameAction"], function (e, t) {
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
        "ResignGameActionFactory",
        (r = class {
          constructor(e, t) {
            ((this.game = e), (this.localPlayerName = t));
          }
          create() {
            return new i.ResignGameAction(this.game, this.localPlayerName);
          }
        }),
      );
    },
  };
});
