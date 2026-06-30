// === Reconstructed SystemJS module: game/event/BuildingRepairFullEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/BuildingRepairFullEvent", ["game/event/EventType"], function (e, t) {
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
        "BuildingRepairFullEvent",
        (r = class {
          constructor(e, t) {
            ((this.target = e), (this.source = t), (this.type = i.EventType.BuildingRepairFull));
          }
        }),
      );
    },
  };
});
