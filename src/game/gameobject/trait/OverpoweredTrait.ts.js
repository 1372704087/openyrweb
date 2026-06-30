// === Reconstructed SystemJS module: game/gameobject/trait/OverpoweredTrait ===
// deps: ["game/gameobject/task/AttackTask","game/gameobject/trait/interface/NotifyTick"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/OverpoweredTrait",
  ["game/gameobject/task/AttackTask", "game/gameobject/trait/interface/NotifyTick"],
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
          constructor(e) {
            ((this.obj = e), (this.chargers = new Set()));
          }
          isOverpowered() {
            let e = 1;
            return (this.obj?.poweredTrait?.isPoweredOn(!0) || (e += 2), this.chargers.size >= e);
          }
          hasChargersToPowerOn() {
            return 2 <= this.chargers.size;
          }
          chargeFrom(e) {
            (this.chargers.add(e), this.swapAttackTaskWeapon());
          }
          [r.NotifyTick.onTick](i) {
            if (0 < this.chargers.size) {
              let t = !1;
              (this.chargers.forEach((e) => {
                (e.isDestroyed || e.isCrashing || e.owner !== i.owner || e.attackTrait?.currentTarget?.obj !== i) &&
                  (this.chargers.delete(e), (t = !0));
              }),
                t && this.swapAttackTaskWeapon());
            }
          }
          swapAttackTaskWeapon() {
            let e = this.obj?.unitOrderTrait.getCurrentTask();
            var t;
            e instanceof i.AttackTask && ((t = this.getWeapon()) ? e.setWeapon(t) : e.cancel());
          }
          getWeapon() {
            return this.isOverpowered() ? this.obj?.secondaryWeapon : this.obj?.primaryWeapon;
          }
          dispose() {
            ((this.obj = void 0), this.chargers.clear());
          }
        }),
          e("OverpoweredTrait", s));
      },
    };
  },
);
