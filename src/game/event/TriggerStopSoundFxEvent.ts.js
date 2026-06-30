// === Reconstructed SystemJS module: game/event/TriggerStopSoundFxEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/TriggerStopSoundFxEvent", ["game/event/EventType"], function (e, t) {
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
        "TriggerStopSoundFxEvent",
        (r = class {
          constructor(e) {
            ((this.tile = e), (this.type = i.EventType.TriggerStopSoundFx));
          }
        }),
      );
    },
  };
});
