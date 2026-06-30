// === Reconstructed SystemJS module: game/event/UnitRepairFinishEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/UnitRepairFinishEvent", ["game/event/EventType"], function (e, t) {
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
        "UnitRepairFinishEvent",
        (r = class {
          constructor(e, t) {
            ((this.target = e), (this.from = t), (this.type = i.EventType.UnitRepairFinish));
          }
        }),
      );
    },
  };
});
