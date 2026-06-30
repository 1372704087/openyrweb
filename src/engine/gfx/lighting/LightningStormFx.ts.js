// === Reconstructed SystemJS module: engine/gfx/lighting/LightningStormFx ===
// deps: ["engine/gfx/lighting/LightingFx"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gfx/lighting/LightningStormFx", ["engine/gfx/lighting/LightingFx"], function (e, t) {
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
        constructor(e, t) {
          (super(), (this.durationGameSeconds = e), (this.ionLighting = t), (this.cloudAnims = []));
        }
        waitForCloudAnim(e) {
          this.cloudAnims.push(e);
        }
        update(e, t) {
          let i = !1,
            r = !1;
          return (
            e === this.startTime && (this.mapLighting.copy(this.ionLighting), (i = !0)),
            ((e - this.startTime) / 1e3) * t > this.durationGameSeconds &&
              !this.cloudAnims.some((e) => !e.isAnimFinished()) &&
              (r = !0),
            { done: r, updated: i }
          );
        }
      }),
        e("LightningStormFx", r));
    },
  };
});
