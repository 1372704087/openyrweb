// === Reconstructed SystemJS module: game/trigger/executor/SetAmbientStepExecutor ===
// deps: ["util/number","game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/executor/SetAmbientStepExecutor",
  ["util/number", "game/trigger/TriggerExecutor"],
  function (e, t) {
    "use strict";
    var i, r, s;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        ((s = class extends r.TriggerExecutor {
          execute(e) {
            var t = i.int32ToFloat32(Number(this.action.params[1]));
            e.mapLightingTrait.setAmbientChangeStep(t);
          }
        }),
          e("SetAmbientStepExecutor", s));
      },
    };
  },
);
