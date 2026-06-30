// === Reconstructed SystemJS module: game/event/TriggerTextEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/TriggerTextEvent", ["game/event/EventType"], function (e, t) {
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
        "TriggerTextEvent",
        (r = class {
          constructor(e) {
            ((this.label = e), (this.type = i.EventType.TriggerText));
          }
        }),
      );
    },
  };
});
