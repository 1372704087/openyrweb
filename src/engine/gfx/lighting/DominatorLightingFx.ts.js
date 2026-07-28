// === Reconstructed SystemJS module: engine/gfx/lighting/DominatorLightingFx ===
// deps: ["engine/gfx/lighting/LightingFx"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// OpenYRWeb: Psychic Dominator red screen tint. When the Dominator fires, the screen
// gets a red ambient tint that lasts through the full animation sequence (FirstAnim
// head + SecondAnim ground ring). Timing covers up to ~10s of hold to accommodate
// the entire animation cycle. The tint is a mild red (green/blue lowered to 0.35
// rather than 0) so the game remains playable.
// Sequence:
//   1. Fades in over 0.3s
//   2. Holds for 5s (covers fire delay → SecondAnim playout)
//   3. Fades out over 1.5s for a smooth transition

System.register("engine/gfx/lighting/DominatorLightingFx", ["engine/gfx/lighting/LightingFx"], function (e, t) {
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
          (super(), (this.priority = i.LightingFxPriority.High), (this.phase = 0));
        }
        update(e, t) {
          let updated = !1,
            done = !1;
          this.initialGreen ?? (this.initialGreen = this.mapLighting.green);
          this.initialBlue ?? (this.initialBlue = this.mapLighting.blue);
          var target = 0.35; // target green/blue during tint (0 = full red, 1 = normal)
          let s = ((e - this.startTime) / 1e3) * t;
          if (s < 0.3) {
            // Phase 1: fade in red tint
            var pct = s / 0.3;
            this.mapLighting.green = this.initialGreen + (target - this.initialGreen) * pct;
            this.mapLighting.blue = this.initialBlue + (target - this.initialBlue) * pct;
            this.mapLighting.forceTint = !0;
            updated = !0;
          } else if (s < 5.3) {
            // Phase 2: hold tint (covers fire delay + SecondAnim playout)
            this.mapLighting.green = target;
            this.mapLighting.blue = target;
            this.mapLighting.forceTint = !0;
            updated = !0;
          } else if (s < 6.8) {
            // Phase 3: fade out
            var pct = (s - 5.3) / 1.5;
            this.mapLighting.green = target + (this.initialGreen - target) * pct;
            this.mapLighting.blue = target + (this.initialBlue - target) * pct;
            updated = !0;
          } else {
            // Done — restore original values
            this.mapLighting.green = this.initialGreen;
            this.mapLighting.blue = this.initialBlue;
            this.mapLighting.forceTint = !1;
            done = !0;
          }
          return { done: done, updated: updated };
        }
      }),
        e("DominatorLightingFx", r));
    },
  };
});
