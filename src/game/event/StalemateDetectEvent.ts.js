// === Reconstructed SystemJS module: game/event/StalemateDetectEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/StalemateDetectEvent", ["game/event/EventType"], function (e, t) {
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
        "StalemateDetectEvent",
        (r = class {
          constructor() {
            this.type = i.EventType.StalemateDetect;
          }
        }),
      );
    },
  };
});
