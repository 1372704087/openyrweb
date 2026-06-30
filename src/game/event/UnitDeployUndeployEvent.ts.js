// === Reconstructed SystemJS module: game/event/UnitDeployUndeployEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/UnitDeployUndeployEvent", ["game/event/EventType"], function (e, t) {
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
        "UnitDeployUndeployEvent",
        (r = class {
          constructor(e, t) {
            ((this.unit = e), (this.deployType = t), (this.type = i.EventType.UnitDeployUndeploy));
          }
        }),
      );
    },
  };
});
