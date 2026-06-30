// === Reconstructed SystemJS module: game/gameobject/trait/C4ChargeTrait ===
// deps: ["game/gameobject/common/DeathType","game/gameobject/unit/Timer","game/gameobject/trait/interface/NotifyTick"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/C4ChargeTrait",
  ["game/gameobject/common/DeathType", "game/gameobject/unit/Timer", "game/gameobject/trait/interface/NotifyTick"],
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
            this.timer = new r.Timer();
          }
          hasCharge() {
            return this.timer.isActive();
          }
          setCharge(e, t) {
            this.hasCharge() || (this.timer.setActiveFor(e), (this.attackerInfo = t));
          }
          [s.NotifyTick.onTick](e, t) {
            this.timer.isActive() &&
              !0 === this.timer.tick(t.currentTick) &&
              (e.invulnerableTrait.isActive() ||
                (e.isBuilding() && e.cabHutTrait
                  ? e.cabHutTrait.demolishBridge(t, this.attackerInfo)
                  : ((e.deathType = i.DeathType.Demolish), t.destroyObject(e, this.attackerInfo, !0))));
          }
        }),
          e("C4ChargeTrait", a));
      },
    };
  },
);
