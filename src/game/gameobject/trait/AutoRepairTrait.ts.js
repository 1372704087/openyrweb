// === Reconstructed SystemJS module: game/gameobject/trait/AutoRepairTrait ===
// deps: ["game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/interface/NotifyOwnerChange","game/GameSpeed"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/AutoRepairTrait",
  ["game/gameobject/trait/interface/NotifyTick", "game/gameobject/trait/interface/NotifyOwnerChange", "game/GameSpeed"],
  function (e, t) {
    "use strict";
    var i, r, n, s;
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
          n = e;
        },
      ],
      execute: function () {
        ((s = class {
          constructor(e = !1) {
            ((this.freeRepair = e), (this.disabled = !0), (this.cooldownTicks = 0), (this.healLeftover = 0));
          }
          isDisabled() {
            return this.disabled;
          }
          setDisabled(e) {
            this.disabled = e;
          }
          [i.NotifyTick.onTick](t, i) {
            if (!this.isDisabled())
              if ((100 === t.healthTrait.health && this.setDisabled(!0), this.cooldownTicks <= 0)) {
                var r = i.rules.general.repair,
                  s = t.isInfantry() ? r.iRepairRate : t.isBuilding() ? r.repairRate : r.uRepairRate;
                this.cooldownTicks += n.GameSpeed.BASE_TICKS_PER_SECOND * s * 60;
                var a = t.isInfantry() ? r.iRepairStep : r.repairStep,
                  s = this.freeRepair ? 0 : r.repairPercent;
                let e;
                (s
                  ? ((r = (s * t.purchaseValue) / t.healthTrait.maxHitPoints),
                    (s = Math.min(t.owner.credits, Math.max(1, Math.floor(r * a))))
                      ? ((e = r ? s / r : a), (t.owner.credits -= s))
                      : ((e = 0), this.setDisabled(!0)))
                  : (e = a),
                  e &&
                    ((e += this.healLeftover),
                    (e = Math.min(t.healthTrait.maxHitPoints - t.healthTrait.getHitPoints(), e)),
                    e && ((a = Math.floor(e)), (this.healLeftover = e - a), a && t.healthTrait.healBy(a, t, i))));
              } else this.cooldownTicks--;
          }
          [r.NotifyOwnerChange.onChange]() {
            this.setDisabled(!0);
          }
        }),
          e("AutoRepairTrait", s));
      },
    };
  },
);
