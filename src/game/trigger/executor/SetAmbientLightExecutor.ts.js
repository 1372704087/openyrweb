// === Reconstructed SystemJS module: game/trigger/executor/SetAmbientLightExecutor ===
// deps: ["game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/executor/SetAmbientLightExecutor", ["game/trigger/TriggerExecutor"], function (e, t) {
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
      ((r = class extends i.TriggerExecutor {
        execute(e) {
          var t = Number(this.action.params[1]) / 100;
          e.mapLightingTrait.setTargetAmbientIntensity(t);
        }
      }),
        e("SetAmbientLightExecutor", r));
    },
  };
});
