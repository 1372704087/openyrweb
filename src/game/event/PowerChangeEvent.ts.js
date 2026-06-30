// === Reconstructed SystemJS module: game/event/PowerChangeEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/PowerChangeEvent", ["game/event/EventType"], function (e, t) {
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
        "PowerChangeEvent",
        (i = class {
          constructor(e, t, i) {
            ((this.target = e), (this.power = t), (this.drain = i), (this.type = r.EventType.PowerChange));
          }
        }),
      );
    },
  };
});
