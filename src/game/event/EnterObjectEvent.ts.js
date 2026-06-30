// === Reconstructed SystemJS module: game/event/EnterObjectEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/EnterObjectEvent", ["game/event/EventType"], function (e, t) {
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
        "EnterObjectEvent",
        (r = class {
          constructor(e, t) {
            ((this.target = e), (this.source = t), (this.type = i.EventType.EnterObject));
          }
        }),
      );
    },
  };
});
