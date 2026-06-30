// === Reconstructed SystemJS module: game/gameobject/trait/TilterTrait ===
// deps: ["game/gameobject/trait/interface/NotifySpawn","game/gameobject/trait/interface/NotifyTileChange"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/TilterTrait",
  ["game/gameobject/trait/interface/NotifySpawn", "game/gameobject/trait/interface/NotifyTileChange"],
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
        ((s = class {
          constructor() {
            this.tilt = { pitch: 0, yaw: 0 };
          }
          [i.NotifySpawn.onSpawn](e) {
            this.tilt = this.computeTilt(e.tile.rampType);
          }
          [r.NotifyTileChange.onTileChange](e) {
            this.tilt = this.computeTilt(e.tile.rampType);
          }
          computeTilt(e) {
            let t, i;
            return (
              0 === e || 17 <= e
                ? (t = i = 0)
                : (i = e <= 4 ? ((t = 25), -90 * e) : ((t = 25), 225 - ((e - 1) % 4) * 90)),
              { pitch: t, yaw: i }
            );
          }
        }),
          e("TilterTrait", s));
      },
    };
  },
);
