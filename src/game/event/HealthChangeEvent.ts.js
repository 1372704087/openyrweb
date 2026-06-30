// === Reconstructed SystemJS module: game/event/HealthChangeEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/HealthChangeEvent", ["game/event/EventType"], function (e, t) {
  "use strict";
  var r, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      e(
        "HealthChangeEvent",
        (i = class {
          constructor(e, t, i) {
            ((this.target = e),
              (this.currentHealth = t),
              (this.prevHealth = i),
              (this.type = r.EventType.HealthChange));
          }
        }),
      );
    },
  };
});
