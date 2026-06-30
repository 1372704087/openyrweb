// === Reconstructed SystemJS module: game/event/ObjectMorphEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/ObjectMorphEvent", ["game/event/EventType"], function (e, t) {
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
        "ObjectMorphEvent",
        (r = class {
          constructor(e, t) {
            ((this.from = e), (this.to = t), (this.type = i.EventType.ObjectMorph));
          }
        }),
      );
    },
  };
});
