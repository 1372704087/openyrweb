// === Reconstructed SystemJS module: game/event/PowerLowEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/PowerLowEvent", ["game/event/EventType"], function (e, t) {
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
        "PowerLowEvent",
        (r = class {
          constructor(e) {
            ((this.target = e), (this.type = i.EventType.PowerLow));
          }
        }),
      );
    },
  };
});
