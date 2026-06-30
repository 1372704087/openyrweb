// === Reconstructed SystemJS module: game/action/factories/PlaceBuildingActionFactory ===
// deps: ["game/action/PlaceBuildingAction"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/action/factories/PlaceBuildingActionFactory",
  ["game/action/PlaceBuildingAction"],
  function (e, t) {
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
          "PlaceBuildingActionFactory",
          (r = class {
            constructor(e) {
              this.game = e;
            }
            create() {
              return new i.PlaceBuildingAction(this.game);
            }
          }),
        );
      },
    };
  },
);
