// === Reconstructed SystemJS module: game/event/CheerEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/CheerEvent", ["game/event/EventType"], function (e, t) {
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
        "CheerEvent",
        (r = class {
          constructor(e) {
            ((this.player = e), (this.type = i.EventType.Cheer));
          }
        }),
      );
    },
  };
});
