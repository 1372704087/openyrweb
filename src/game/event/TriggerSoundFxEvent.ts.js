// === Reconstructed SystemJS module: game/event/TriggerSoundFxEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/TriggerSoundFxEvent", ["game/event/EventType"], function (e, t) {
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
        "TriggerSoundFxEvent",
        (r = class {
          constructor(e, t) {
            ((this.soundId = e), (this.tile = t), (this.type = i.EventType.TriggerSoundFx));
          }
        }),
      );
    },
  };
});
