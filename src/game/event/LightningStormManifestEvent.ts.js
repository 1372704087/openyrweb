// === Reconstructed SystemJS module: game/event/LightningStormManifestEvent ===
// deps: ["game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/event/LightningStormManifestEvent", ["game/event/EventType"], function (e, t) {
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
        "LightningStormManifestEvent",
        (r = class {
          constructor(e) {
            ((this.target = e), (this.type = i.EventType.LightningStormManifest));
          }
        }),
      );
    },
  };
});
