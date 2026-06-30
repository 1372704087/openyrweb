// === Reconstructed SystemJS module: engine/gfx/lighting/NukeLightingFx ===
// deps: ["engine/gfx/lighting/LightingFx"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gfx/lighting/NukeLightingFx", ["engine/gfx/lighting/LightingFx"], function (e, t) {
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
      ((r = class extends i.LightingFx {
        constructor() {
          (super(), (this.priority = i.LightingFxPriority.High));
        }
        update(e, t) {
          let i = !1,
            r = !1;
          this.initialAmbient ?? (this.initialAmbient = this.mapLighting.ambient);
          let s,
            a = ((e - this.startTime) / 1e3) * t;
          var n;
          return (
            3.3 <= a
              ? ((a -= 3.3), (n = Math.min(1, a / 0.5)), (s = this.initialAmbient + 1.5 * (1 - n)), 1 === n && (r = !0))
              : a < 0.3 && ((n = a / 0.3), (s = this.initialAmbient + 1.5 * n)),
            void 0 !== s && this.mapLighting.ambient !== s && ((i = !0), (this.mapLighting.ambient = s)),
            { done: r, updated: i }
          );
        }
      }),
        e("NukeLightingFx", r));
    },
  };
});
