// === Reconstructed SystemJS module: game/event/RadarEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/RadarEvent", ["game/event/EventType"], function (e, t) {
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
        "RadarEvent",
        (i = class {
          constructor(e, t, i) {
            ((this.target = e), (this.radarEventType = t), (this.tile = i), (this.type = r.EventType.RadarEvent));
          }
        }),
      );
    },
  };
});
