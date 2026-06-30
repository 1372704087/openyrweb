// === Reconstructed SystemJS module: game/gameobject/trait/DrainTrait ===
// deps: ["game/gameobject/trait/interface/NotifyAttack","game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/interface/NotifyUnspawn","game/gameobject/trait/interface/NotifyDestroy"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// OpenYRWeb: Floating Disc (DISCUS) drain logic (YR). Attached to Harvester=yes units that
// target buildings (vanilla: the Yuri Floating Disc). When the unit attacks a Drainable=yes
// building it siphons from it instead of damaging it:
//   - Refinery / Slave Miner → every DrainMoneyFrameDelay ticks, DrainMoneyAmount credits
//     are transferred from the building's owner to the disc's owner (vanilla default 30$/30f).
//   - Power plant / powered base defense → the building is flagged as "drained" so its power
//     output / weapon is suppressed while the disc is attached (visual + gameplay disable).
// The drain stops the moment the disc retargets, dies, the building dies, or the building
// changes owner. Mirrors the engine-level drain in yrmd.exe (DrainMoneyAmount /
// DrainMoneyFrameDelay / DrainAnimationType / Drainable / DrainWeapon strings).
//
// Design notes:
//   - Damage to drainable buildings is NOT applied by this trait; the disc's normal weapon is
//     expected to deal negligible/zero damage so the building survives (vanilla behaviour — a
//     drained building is never destroyed by the disc).
//   - The "drained" power-disable is a soft flag consumed by PowerTrait; it does not by itself
//     zero the building's power field, to avoid clobbering health-based power scaling.

System.register(
  "game/gameobject/trait/DrainTrait",
  [
    "game/gameobject/trait/interface/NotifyAttack",
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/trait/interface/NotifyUnspawn",
    "game/gameobject/trait/interface/NotifyDestroy",
  ],
  function (e, t) {
    "use strict";
    var n, i, r, d;
    t && t.id;
    return {
      setters: [
        function (e) {
          n = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          d = e;
        },
      ],
      execute: function () {
        var s;
        e(
          "DrainTrait",
          (s = class {
            constructor() {
              // The building currently being drained (set on NotifyAttack against a Drainable).
              this.drainTarget = void 0;
              // Ticks remaining until the next money siphon.
              this.drainTicksLeft = 0;
              // True while this disc is actively suppressing the target's power/weapon.
              this.draining = !1;
            }
            // Detach from the current drain target: clear our state and the building's
            // drained flag (so its power/defenses come back online). Safe to call repeatedly.
            _detach(e) {
              if (this.drainTarget && !this.drainTarget.isDisposed && !this.drainTarget.isDestroyed)
                this.drainTarget.drainedBy = void 0;
              (this.drainTarget = void 0), (this.draining = !1), (this.drainTicksLeft = 0);
            }
            [n.NotifyAttack.onAttack](e, t, a) {
              // Only drain buildings flagged Drainable=yes. Re-targeting swaps the drain.
              if (!t || !t.isBuilding || !t.isBuilding() || !t.rules.drainable) {
                if (this.drainTarget && t !== this.drainTarget) this._detach();
                return;
              }
              if (t !== this.drainTarget) {
                if (this.drainTarget) this._detach();
                this.drainTarget = t;
                this.drainTicksLeft = 1; // siphon on the first eligible tick
              }
              this.draining = !0;
              // Mark the building as drained so PowerTrait/defenses can suppress it.
              t.drainedBy = e;
            }
            [i.NotifyTick.onTick](e, t) {
              var target = this.drainTarget;
              // Drop the drain if the target is gone, swapped owner to us, or we are dead.
              if (
                !target ||
                target.isDisposed ||
                target.isDestroyed ||
                target.owner === e.owner ||
                t.areFriendly(target.owner, e.owner)
              ) {
                this._detach();
                return;
              }
              // Keep the suppression flag fresh while we are still attacking it.
              target.drainedBy = e;
              // Money siphon (refinery / slave miner). Vanilla: DrainMoneyAmount every
              // DrainMoneyFrameDelay ticks. No-op if the global config is unset/zero.
              var cd = t.rules.combatDamage;
              if (cd && cd.drainMoneyAmount > 0 && cd.drainMoneyFrameDelay > 0) {
                if (this.drainTicksLeft <= 0) this.drainTicksLeft = cd.drainMoneyFrameDelay;
                if (--this.drainTicksLeft <= 0) {
                  var amt = cd.drainMoneyAmount,
                    victim = target.owner,
                    me = e.owner;
                  if (victim && me && victim !== me) {
                    var steal = Math.min(amt, Math.max(0, victim.credits));
                    if (steal > 0) {
                      victim.credits -= steal;
                      me.credits += steal;
                      me.creditsGained += steal;
                    }
                  }
                }
              }
            }
            // If the drained building is destroyed, stop draining.
            [d.NotifyDestroy.onDestroy](e, t, i) {
              if (this.drainTarget && (e === this.drainTarget || t?.obj === this.drainTarget)) this._detach();
            }
            [r.NotifyUnspawn.onUnspawn](e, t) {
              // disc died / was removed → release the building
              this._detach();
            }
          }),
        );
      },
    };
  },
);
