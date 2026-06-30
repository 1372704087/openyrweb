// === Reconstructed SystemJS module: game/trigger/condition/AmbientLightCondition ===
// deps: ["game/trigger/TriggerCondition"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/trigger/condition/AmbientLightCondition", ["game/trigger/TriggerCondition"], function (e, t) {
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
      ((r = class extends i.TriggerCondition {
        constructor(e, t, i) {
          (super(e, t), (this.type = i), (this.threshold = Number(e.params[1]) / 100));
        }
        check(e) {
          var t = this.previousAmbient,
            i = e.mapLightingTrait.getAmbient().ambient;
          return (
            (this.previousAmbient = i),
            void 0 !== t &&
              t !== i &&
              ("above" === this.type
                ? i >= this.threshold && t < this.threshold
                : i <= this.threshold && t > this.threshold)
          );
        }
      }),
        e("AmbientLightCondition", r));
    },
  };
});
