// === Reconstructed SystemJS module: game/event/CratePickupEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/CratePickupEvent", ["game/event/EventType"], function (e, t) {
  "use strict";
  var s, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        s = e;
      },
    ],
    execute: function () {
      e(
        "CratePickupEvent",
        (i = class {
          constructor(e, t, i, r) {
            ((this.target = e),
              (this.player = t),
              (this.source = i),
              (this.tile = r),
              (this.type = s.EventType.CratePickup));
          }
        }),
      );
    },
  };
});
