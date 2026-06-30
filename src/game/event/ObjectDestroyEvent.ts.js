// === Reconstructed SystemJS module: game/event/ObjectDestroyEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/ObjectDestroyEvent", ["game/event/EventType"], function (e, t) {
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
        "ObjectDestroyEvent",
        (i = class {
          constructor(e, t, i) {
            ((this.target = e),
              (this.attackerInfo = t),
              (this.incidental = i),
              (this.type = r.EventType.ObjectDestroy));
          }
        }),
      );
    },
  };
});
