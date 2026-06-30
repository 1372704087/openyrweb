// === Reconstructed SystemJS module: game/event/InflictDamageEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/InflictDamageEvent", ["game/event/EventType"], function (e, t) {
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
        "InflictDamageEvent",
        (i = class {
          constructor(e, t, i, r, s) {
            ((this.target = e),
              (this.attacker = t),
              (this.damageHitPoints = i),
              (this.currentHealth = r),
              (this.prevHealth = s),
              (this.type = a.EventType.InflictDamage));
          }
        }),
      );
    },
  };
});
