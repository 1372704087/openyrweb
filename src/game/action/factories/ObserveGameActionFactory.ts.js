// === Reconstructed SystemJS module: game/action/factories/ObserveGameActionFactory ===
// deps: ["game/action/ObserveGameAction"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/action/factories/ObserveGameActionFactory", ["game/action/ObserveGameAction"], function (e, t) {
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
        "ObserveGameActionFactory",
        (r = class {
          constructor(e) {
            this.game = e;
          }
          create() {
            return new i.ObserveGameAction(this.game);
          }
        }),
      );
    },
  };
});
