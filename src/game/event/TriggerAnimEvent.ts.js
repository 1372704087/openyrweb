// === Reconstructed SystemJS module: game/event/TriggerAnimEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/TriggerAnimEvent", ["game/event/EventType"], function (e, t) {
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
        "TriggerAnimEvent",
        (r = class {
          constructor(e, t) {
            ((this.name = e), (this.tile = t), (this.type = i.EventType.TriggerAnim));
          }
        }),
      );
    },
  };
});
