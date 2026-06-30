// === Reconstructed SystemJS module: game/event/LeaveTransportEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/LeaveTransportEvent", ["game/event/EventType"], function (e, t) {
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
        "LeaveTransportEvent",
        (r = class {
          constructor(e) {
            ((this.target = e), (this.type = i.EventType.LeaveTransport));
          }
        }),
      );
    },
  };
});
