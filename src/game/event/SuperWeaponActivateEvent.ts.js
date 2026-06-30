// === Reconstructed SystemJS module: game/event/SuperWeaponActivateEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/SuperWeaponActivateEvent", ["game/event/EventType"], function (e, t) {
  "use strict";
  var a, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        a = e;
      },
    ],
    execute: function () {
      e(
        "SuperWeaponActivateEvent",
        (i = class {
          constructor(e, t, i, r, s) {
            ((this.target = e),
              (this.owner = t),
              (this.atTile = i),
              (this.atTile2 = r),
              (this.noSfxWarning = s),
              (this.type = a.EventType.SuperWeaponActivate));
          }
        }),
      );
    },
  };
});
