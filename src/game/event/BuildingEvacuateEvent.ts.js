// === Reconstructed SystemJS module: game/event/BuildingEvacuateEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/BuildingEvacuateEvent", ["game/event/EventType"], function (e, t) {
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
        "BuildingEvacuateEvent",
        (r = class {
          constructor(e, t) {
            ((this.target = e), (this.player = t), (this.type = i.EventType.BuildingEvacuate));
          }
        }),
      );
    },
  };
});
