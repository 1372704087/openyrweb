// === Reconstructed SystemJS module: game/event/PlayerResignedEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/PlayerResignedEvent", ["game/event/EventType"], function (e, t) {
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
        "PlayerResignedEvent",
        (r = class {
          constructor(e, t) {
            ((this.target = e), (this.assetsRedistributed = t), (this.type = i.EventType.PlayerResigned));
          }
        }),
      );
    },
  };
});
