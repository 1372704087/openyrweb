// === Reconstructed SystemJS module: game/action/factories/SellObjectActionFactory ===
// deps: ["game/action/SellObjectAction"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/action/factories/SellObjectActionFactory", ["game/action/SellObjectAction"], function (e, t) {
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
        "SellObjectActionFactory",
        (r = class {
          constructor(e) {
            this.game = e;
          }
          create() {
            return new i.SellObjectAction(this.game);
          }
        }),
      );
    },
  };
});
