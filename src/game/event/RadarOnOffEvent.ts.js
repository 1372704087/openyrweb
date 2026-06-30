// === Reconstructed SystemJS module: game/event/RadarOnOffEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/RadarOnOffEvent", ["game/event/EventType"], function (e, t) {
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
        "RadarOnOffEvent",
        (r = class {
          constructor(e, t) {
            ((this.target = e), (this.radarEnabled = t), (this.type = i.EventType.RadarOnOff));
          }
        }),
      );
    },
  };
});
