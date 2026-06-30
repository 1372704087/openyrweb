// === Reconstructed SystemJS module: game/action/factories/SelectUnitsActionFactory ===
// deps: ["game/action/SelectUnitsAction"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/action/factories/SelectUnitsActionFactory", ["game/action/SelectUnitsAction"], function (e, t) {
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
        "SelectUnitsActionFactory",
        (r = class {
          constructor(e, t) {
            ((this.game = e), (this.orderActionContext = t));
          }
          create() {
            return new i.SelectUnitsAction(this.game, this.orderActionContext);
          }
        }),
      );
    },
  };
});
