// === Reconstructed SystemJS module: game/event/ObjectAttackedEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/ObjectAttackedEvent", ["game/event/EventType"], function (e, t) {
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
        "ObjectAttackedEvent",
        (i = class {
          constructor(e, t, i) {
            ((this.target = e), (this.attacker = t), (this.incidental = i), (this.type = r.EventType.ObjectAttacked));
          }
        }),
      );
    },
  };
});
