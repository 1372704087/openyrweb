// === Reconstructed SystemJS module: game/trigger/executor/SetAmbientRateExecutor ===
// deps: ["util/number","game/trigger/TriggerExecutor"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/trigger/executor/SetAmbientRateExecutor",
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
            e.mapLightingTrait.setAmbientChangeRate(t);
          }
        }),
          e("SetAmbientRateExecutor", s));
      },
    };
  },
);
