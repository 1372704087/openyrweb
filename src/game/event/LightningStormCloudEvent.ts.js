// === Reconstructed SystemJS module: game/event/LightningStormCloudEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/LightningStormCloudEvent", ["game/event/EventType"], function (e, t) {
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
        "LightningStormCloudEvent",
        (r = class {
          constructor(e) {
            ((this.position = e), (this.type = i.EventType.LightningStormCloud));
          }
        }),
      );
    },
  };
});
