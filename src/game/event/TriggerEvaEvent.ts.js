// === Reconstructed SystemJS module: game/event/TriggerEvaEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/TriggerEvaEvent", ["game/event/EventType"], function (e, t) {
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
        "TriggerEvaEvent",
        (r = class {
          constructor(e) {
            ((this.soundId = e), (this.type = i.EventType.TriggerEva));
          }
        }),
      );
    },
  };
});
