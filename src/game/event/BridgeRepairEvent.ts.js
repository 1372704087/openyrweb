// === Reconstructed SystemJS module: game/event/BridgeRepairEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/BridgeRepairEvent", ["game/event/EventType"], function (e, t) {
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
        "BridgeRepairEvent",
        (r = class {
          constructor(e, t) {
            ((this.source = e), (this.tile = t), (this.type = i.EventType.BridgeRepair));
          }
        }),
      );
    },
  };
});
