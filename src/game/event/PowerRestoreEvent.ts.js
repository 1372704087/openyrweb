// === Reconstructed SystemJS module: game/event/PowerRestoreEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/PowerRestoreEvent", ["game/event/EventType"], function (e, t) {
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
        "PowerRestoreEvent",
        (r = class {
          constructor(e) {
            ((this.target = e), (this.type = i.EventType.PowerRestore));
          }
        }),
      );
    },
  };
});
