// === Reconstructed SystemJS module: game/event/PingLocationEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/PingLocationEvent", ["game/event/EventType"], function (e, t) {
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
        "PingLocationEvent",
        (r = class {
          constructor(e, t) {
            ((this.tile = e), (this.player = t), (this.type = i.EventType.PingLocation));
          }
        }),
      );
    },
  };
});
