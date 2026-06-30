// === Reconstructed SystemJS module: game/event/ObjectOwnerChangeEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/ObjectOwnerChangeEvent", ["game/event/EventType"], function (e, t) {
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
        "ObjectOwnerChangeEvent",
        (r = class {
          constructor(e, t) {
            ((this.target = e), (this.prevOwner = t), (this.type = i.EventType.ObjectOwnerChange));
          }
        }),
      );
    },
  };
});
