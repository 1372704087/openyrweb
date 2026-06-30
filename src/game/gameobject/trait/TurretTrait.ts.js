// === Reconstructed SystemJS module: game/gameobject/trait/TurretTrait ===
// deps: ["game/gameobject/unit/FacingUtil","game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/interface/NotifySpawn"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/TurretTrait",
  [
    "game/gameobject/unit/FacingUtil",
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/trait/interface/NotifySpawn",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        ((a = class {
          constructor() {
            ((this.facing = 0), (this.desiredFacing = 0));
          }
          isRotating() {
            return this.facing !== this.desiredFacing;
          }
          [s.NotifySpawn.onSpawn](e) {
            e.isUnit() && (this.facing = this.desiredFacing = e.direction);
          }
          [r.NotifyTick.onTick](e) {
            var t;
            this.desiredFacing !== this.facing &&
              ((t = e.rules.rot),
              (this.facing = i.FacingUtil.tick(this.facing, this.desiredFacing, t || Number.POSITIVE_INFINITY).facing));
          }
        }),
          e("TurretTrait", a));
      },
    };
  },
);
