// === Reconstructed SystemJS module: game/event/ObjectTeleportEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/ObjectTeleportEvent", ["game/event/EventType"], function (e, t) {
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
        "ObjectTeleportEvent",
        (i = class {
          constructor(e, t, i) {
            ((this.target = e),
              (this.isChronoshift = t),
              (this.prevTile = i),
              (this.type = r.EventType.ObjectTeleport));
          }
        }),
      );
    },
  };
});
