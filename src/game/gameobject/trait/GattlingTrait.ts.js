// === Reconstructed SystemJS module: game/gameobject/trait/GattlingTrait ===
// deps: ["game/gameobject/unit/VeteranLevel","game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/interface/NotifyAttack"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// OpenYRWeb: Gattling weapon escalation (YR). Attached to technos with WeaponCount>1 that are
// NOT gunners (i.e. not IFV-style turret swaps). Each time the unit fires (NotifyAttack) it
// advances one stage (higher stage = faster ROF / higher damage in the unit's WeaponN data),
// capped at the last stage. The stage then holds while firing and decays back to stage 0 only
// after a spin-down grace period (SPIN_DOWN_TICKS) with no fire event — matching the cookgreen
// OpenRA mod's time-based `GrantConditionOnStage` (stage-1..3 at 200/400/600 ticks) rather than
// the earlier per-tick instant reset, which dropped the spin every brief inter-burst gap.

System.register(
  "game/gameobject/trait/GattlingTrait",
  ["game/gameobject/unit/VeteranLevel", "game/gameobject/trait/interface/NotifyTick", "game/gameobject/trait/interface/NotifyAttack"],
  function (e, t) {
    "use strict";
    var r, i, n;
    t && t.id;
    return {
      setters: [
        function (e) {
          r = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          n = e;
        },
      ],
      execute: function () {
        var s;
        // Spin-down grace (ticks of no firing before the gattling resets to stage 0). Sized to
        // the cookgreen stage threshold order of magnitude (~200 ticks) so the spin holds across
        // short ROF gaps but decays when the unit truly stops engaging.
        var SPIN_DOWN_TICKS = 200;
        e(
          "GattlingTrait",
          (s = class {
            constructor() {
              this.stage = 0;
              this.firedThisTick = !1;
              this._idleTicks = 0;
            }
            [n.NotifyAttack.onAttack](e, t, a) {
              // Advance one stage per shot, capped at the last weapon stage.
              var i = e.rules.weaponCount;
              if (!(i < 2)) {
                (this.firedThisTick = !0),
                  (this._idleTicks = 0),
                  this.stage < i - 1 &&
                    ((this.stage = this.stage + 1),
                    e.armedTrait?.selectSpecialWeapon(this.stage, e.veteranLevel === r.VeteranLevel.Elite));
              }
            }
            [i.NotifyTick.onTick](e, t) {
              if (this.stage <= 0) return;
              // Track idle ticks since the last fire event; only spin down once the grace window
              // elapses, so brief ROF gaps (e.g. between bursts) don't drop the gattling stage.
              if (this.firedThisTick) {
                this.firedThisTick = !1;
                this._idleTicks = 0;
                return;
              }
              if (++this._idleTicks < SPIN_DOWN_TICKS) return;
              ((this.stage = 0),
                (this._idleTicks = 0),
                e.armedTrait?.selectSpecialWeapon(0, e.veteranLevel === r.VeteranLevel.Elite),
                // OpenYRWeb: stop any looping weapon-fire sound when gattling spins down.
                e.__weaponFireSound && e.__weaponFireSound.isPlaying() && (e.__weaponFireSound.stop(), (e.__weaponFireSound = void 0)));
            }
          }),
        );
      },
    };
  },
);

