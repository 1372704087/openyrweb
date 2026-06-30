// === Reconstructed SystemJS module: game/action/OrderActionContext ===
// deps: ["game/gameobject/selection/UnitSelectionLite"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/action/OrderActionContext", ["game/gameobject/selection/UnitSelectionLite"], function (e, t) {
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
        "OrderActionContext",
        (r = class {
          constructor() {
            this.unitSelectionByPlayer = new Map();
          }
          getOrCreateSelection(e) {
            let t = this.unitSelectionByPlayer.get(e);
            return (t || ((t = new i.UnitSelectionLite(e)), this.unitSelectionByPlayer.set(e, t)), t);
          }
        }),
      );
    },
  };
});
