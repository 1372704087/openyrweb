// === Reconstructed SystemJS module: game/event/BuildingFailedPlaceEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/BuildingFailedPlaceEvent", ["game/event/EventType"], function (e, t) {
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
        "BuildingFailedPlaceEvent",
        (i = class {
          constructor(e, t, i) {
            ((this.name = e), (this.player = t), (this.tile = i), (this.type = r.EventType.BuildingFailedPlace));
          }
        }),
      );
    },
  };
});
