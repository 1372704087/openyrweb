// === Reconstructed SystemJS module: game/event/WarheadDetonateEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/WarheadDetonateEvent", ["game/event/EventType"], function (e, t) {
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
        "WarheadDetonateEvent",
        (i = class {
          constructor(e, t, i, r) {
            ((this.target = e),
              (this.position = t),
              (this.explodeAnim = i),
              (this.isLightningStrike = r),
              (this.type = s.EventType.WarheadDetonate));
          }
        }),
      );
    },
  };
});
