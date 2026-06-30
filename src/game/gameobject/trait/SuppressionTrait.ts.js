// === Reconstructed SystemJS module: game/gameobject/trait/SuppressionTrait ===
// deps: ["game/gameobject/trait/interface/NotifyTick"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/SuppressionTrait",
  ["game/gameobject/trait/interface/NotifyTick"],
  function (e, t) {
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
        ((r = class {
          constructor() {
            ((this.suppressionTicks = 0), (this.enabled = !0));
          }
          disable() {
            this.enabled = !1;
          }
          isSuppressed() {
            return this.enabled && 0 < this.suppressionTicks;
          }
          suppress() {
            this.enabled && (this.suppressionTicks = 30);
          }
          [i.NotifyTick.onTick]() {
            0 < this.suppressionTicks && this.suppressionTicks--;
          }
        }),
          e("SuppressionTrait", r));
      },
    };
  },
);
