// === Reconstructed SystemJS module: game/event/ObjectLandEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/ObjectLandEvent", ["game/event/EventType"], function (e, t) {
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
        "ObjectLandEvent",
        (r = class {
          constructor(e) {
            ((this.gameObject = e), (this.type = i.EventType.ObjectLand));
          }
        }),
      );
    },
  };
});
