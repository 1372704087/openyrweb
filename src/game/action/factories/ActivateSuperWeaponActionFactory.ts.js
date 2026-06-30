// === Reconstructed SystemJS module: game/action/factories/ActivateSuperWeaponActionFactory ===
// deps: ["game/action/ActivateSuperWeaponAction"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/action/factories/ActivateSuperWeaponActionFactory",
  ["game/action/ActivateSuperWeaponAction"],
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
          "ActivateSuperWeaponActionFactory",
          (r = class {
            constructor(e) {
              this.game = e;
            }
            create() {
              return new i.ActivateSuperWeaponAction(this.game);
            }
          }),
        );
      },
    };
  },
);
