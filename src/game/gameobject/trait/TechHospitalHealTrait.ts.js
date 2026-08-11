// === Reconstructed SystemJS module: game/gameobject/trait/TechHospitalHealTrait ===
// deps: ["game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/interface/NotifyDestroy","game/gameobject/trait/interface/NotifyOwnerChange"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// OpenYRWeb: YR Tech Hospital self-heal logic (InfantryGainSelfHeal / UnitsGainSelfHeal).
// When a building with InfantryGainSelfHeal>0 or UnitsGainSelfHeal>0 is owned by a player,
// all of the owner's infantry/units on the map are periodically healed without needing to
// enter the building. Only the build owner benefits — neutral/unowned buildings do nothing.
// Healing rate is controlled by [General] SelfHealInfantryFrames, SelfHealInfantryAmount,
// SelfHealUnitFrames, and SelfHealUnitAmount.
//
// See ModEnc: InfantryGainSelfHeal, UnitsGainSelfHeal, SelfHealInfantryFrames, etc.

System.register(
  "game/gameobject/trait/TechHospitalHealTrait",
  [
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/trait/interface/NotifyDestroy",
    "game/gameobject/trait/interface/NotifyOwnerChange",
  ],
  function (e, t) {
    "use strict";
    var i, r, n, c;
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
        e(
          "TechHospitalHealTrait",
          (c = class {
            constructor() {
              this.tickCounter = 0;
            }
            // Heal all friendly infantry on the map for this building's owner.
            _healInfantry(e, t) {
              var i = t.rules.general.selfHealInfantryAmount * e.rules.infantryGainSelfHeal;
              if (i <= 0) return;
              var r = t.world.getAllObjects();
              for (var n = 0; n < r.length; n++) {
                var s = r[n];
                if (
                  s.isInfantry() &&
                  s.owner === e.owner &&
                  !s.isDestroyed &&
                  s.healthTrait &&
                  s.healthTrait.health < 100
                ) {
                  s.healthTrait.healBy(i, e, t);
                  // Transient flag for the renderer (PipOverlay): this unit's HP gain came
                  // from the hospital heal, so the heal icon flashes. Covers the pulse that
                  // restores the unit to full HP (checked against the pre-heal health above).
                  s.__hospitalHealFlash = !0;
                }
              }
            }
            // Heal all friendly vehicles on the map for this building's owner.
            _healUnits(e, t) {
              var i = t.rules.general.selfHealUnitAmount * e.rules.unitsGainSelfHeal;
              if (i <= 0) return;
              var r = t.world.getAllObjects();
              for (var n = 0; n < r.length; n++) {
                var s = r[n];
                if (
                  s.isVehicle() &&
                  s.owner === e.owner &&
                  !s.isDestroyed &&
                  s.healthTrait &&
                  s.healthTrait.health < 100
                ) {
                  s.healthTrait.healBy(i, e, t);
                  // Transient flag for the renderer (PipOverlay): see _healInfantry.
                  s.__hospitalHealFlash = !0;
                }
              }
            }
            [i.NotifyTick.onTick](e, t) {
              // Only heal when the building is fully built (BuildStatus.Ready = 1) and owned by a
              // real player — mirrors the PipOverlay icon gate (`buildStatus !== 1`), so the
              // building has no effect while under construction or being sold.
              if (!e.owner || e.isDestroyed || e.buildStatus !== 1) return;
              this.tickCounter++;
              var i = t.rules.general;
              e.rules.infantryGainSelfHeal > 0 &&
                this.tickCounter % i.selfHealInfantryFrames === 0 &&
                this._healInfantry(e, t);
              e.rules.unitsGainSelfHeal > 0 &&
                this.tickCounter % i.selfHealUnitFrames === 0 &&
                this._healUnits(e, t);
            }
            [r.NotifyDestroy.onDestroy](e, t, i) {
              // No cleanup needed — trait is per-building and destroyed with it.
            }
            [n.NotifyOwnerChange.onChange](e, t, i) {
              // Reset tick counter on owner change (e.g. engineer capture) so the
              // healing pulse timing restarts cleanly under the new owner.
              this.tickCounter = 0;
            }
          }),
        );
      },
    };
  },
);
