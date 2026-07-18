// === Reconstructed SystemJS module: game/gameobject/trait/DrainTrait ===
// deps: ["game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/interface/NotifyUnspawn","game/gameobject/trait/interface/NotifyDestroy"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// OpenYRWeb: Floating Disc (DISCUS) drain logic (YR). Attached to units whose weapon
// is marked DrainWeapon=yes (vanilla: the Yuri Floating Disc). When the DrainWeapon
// strikes a Drainable=yes building the drain starts:
//   - Refinery / Slave Miner → every DrainMoneyFrameDelay ticks, DrainMoneyAmount credits
//     are transferred from the building's owner to the disc's owner (vanilla default 30$/30f).
//   - Power plant / powered base defense → the building is flagged as "drained" so its power
//     output / weapon is suppressed while the disc is attached (visual + gameplay disable).
// The drain stops the moment the disc stops attacking the building (switches target,
// is given a move order, or its AttackTask ends), retargets, dies, the building dies,
// or the building changes owner.
//
// Trigger path: Warhead.detonate() calls startDrain() directly when a DrainWeapon warhead
// hits a Drainable building. The earlier NotifyAttack-based trigger was dead code because
// Warhead.inflictDamage() iterates game.traits (which has no NotifyAttack traits) — the
// attacker's traits were never notified. The earlier NotifyTick auto-attach workaround is
// removed; the weapon hit is now the sole trigger, matching vanilla YR's DrainWeapon path.
//
// Design notes:
//   - Damage to drainable buildings is NOT applied by this trait; the disc's normal weapon is
//     expected to deal negligible/zero damage so the building survives (vanilla behaviour — a
//     drained building is never destroyed by the disc).
//   - The "drained" power-disable is a soft flag consumed by PowerTrait; it does not by itself
//     zero the building's power field, to avoid clobbering health-based power scaling.
//   - FireOnce=yes on DiskDrain means the drain LOGIC triggers once per hit; the weapon
//     itself fires repeatedly (every ROF=50 ticks) to refresh the drain while the disc hovers.
//   - FireWhileMoving=no ensures the disc must be stationary to fire DiskDrain (enforced in
//     AttackTask), so the disc is always hovering when the drain triggers.

System.register(
  "game/gameobject/trait/DrainTrait",
  [
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/trait/interface/NotifyUnspawn",
    "game/gameobject/trait/interface/NotifyDestroy",
  ],
  function (e, t) {
    "use strict";
    var i, r, d;
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
          d = e;
        },
      ],
      execute: function () {
        var s;
        e(
          "DrainTrait",
          (s = class {
            constructor() {
              // The building currently being drained (set by startDrain when DiskDrain hits a Drainable).
              this.drainTarget = void 0;
              // Ticks remaining until the next money siphon.
              this.drainTicksLeft = 0;
              // True while this disc is actively suppressing the target's power/weapon.
              this.draining = !1;
              // Cooldown between primary-weapon target scans (ticks). Avoids O(n²) scan every tick.
              this.primaryScanCooldown = 0;
            }
            // Start draining a building. Called from Warhead.detonate() when a DrainWeapon
            // warhead hits a Drainable=yes building. If already draining the same building,
            // this is a no-op refresh. If draining a different building, the old drain detaches.
            startDrain(e, t, a) {
              if (!t || !t.isBuilding || !t.isBuilding() || !t.rules.drainable) {
                return;
              }
              // OpenYRWeb: reject drain on friendly/own buildings to prevent infinite
              // attach-detach loop (weapon hits → startDrain → power drops → tick detach
              // via areFriendly → power restores → weapon fires again → repeat).
              if (t.owner === e.owner || a.areFriendly(t, e)) {
                return;
              }
              // OpenYRWeb: reject drain if another disc is already draining this building.
              // This prevents multiple Floating Discs from draining the same building
              // simultaneously (targeting check in WeaponTargeting prevents the weapon from
              // firing, but this is a defense-in-depth guard for the drain path).
              if (t.drainedBy && t.drainedBy !== e) {
                return;
              }
              if (t === this.drainTarget) {
                // Refresh: already draining this building.
                this.draining = !0;
                t.drainedBy = e;
                return;
              }
              if (this.drainTarget) this._detach(a);
              (this.drainTarget = t),
                (this.draining = !0),
                (this.drainTicksLeft = 1), // siphon on the first eligible tick
                // Mark the building as drained so PowerTrait/defenses can suppress it.
                (t.drainedBy = e);
              // OpenYRWeb: draining a power plant overrides the owner's displayed power to 0.
              t.rules.power > 0 && t.owner?.powerTrait && t.owner.powerTrait.drainPowerOverride++;
              // OpenYRWeb: suppress the building's power contribution while draining.
              a && t.owner?.powerTrait?.updateFrom(t, "update", a);
            }
            // Detach from the current drain target: clear our state and the building's
            // drained flag (so its power/defenses come back online). Safe to call repeatedly.
            _detach(e) {
              if (this.drainTarget && !this.drainTarget.isDisposed && !this.drainTarget.isDestroyed) {
                var wasPowerPlant = this.drainTarget.rules.power > 0;
                this.drainTarget.drainedBy = void 0;
                // OpenYRWeb: restore the building's power contribution when the drain ends.
                e && this.drainTarget.owner?.powerTrait?.updateFrom(this.drainTarget, "update", e);
                // OpenYRWeb: release the global power-override counter if this was a power plant.
                if (wasPowerPlant && this.drainTarget.owner?.powerTrait) {
                  this.drainTarget.owner.powerTrait.drainPowerOverride = Math.max(0, this.drainTarget.owner.powerTrait.drainPowerOverride - 1);
                  e && this.drainTarget.owner.powerTrait.updateLevel(e);
                }
              }
              (this.drainTarget = void 0), (this.draining = !1), (this.drainTicksLeft = 0);
            }
            // Check whether the disc is still actively attacking this building.
            // Vanilla YR: the drain persists while the disc keeps firing DiskDrain at the
            // building (ROF=50 refreshes the drain every hit). When the disc switches target,
            // is given a move order, or its AttackTask ends, currentTarget changes/clears and
            // the drain detaches. This correctly handles Range=1.5 (the disc hovers on an
            // ADJACENT tile, not directly above the building's foundation — a physical
            // tile-overlap check would wrongly break the drain immediately).
            _isStillAttacking(e, t) {
              if (!t) return !1;
              var ct = e.attackTrait?.currentTarget;
              return !!ct && ct.obj === t;
            }
            [i.NotifyTick.onTick](e, t) {
              var target = this.drainTarget;
              // No drain target → nothing to do.
              if (!target) return;
              // Drop the drain if the target is gone, swapped owner to us, or we are dead.
              if (
                target.isDisposed ||
                target.isDestroyed ||
                target.owner === e.owner ||
                t.areFriendly(target, e)
              ) {
                this._detach(t);
                return;
              }
              // Drop the drain if the disc is no longer attacking this building
              // (switched target, given a move order, or AttackTask ended).
              if (!this._isStillAttacking(e, target)) {
                var ct = e.attackTrait?.currentTarget;
                // OpenYRWeb: if there IS a new ongoing attack on a different
                // target within primary weapon range, keep draining — the disc
                // fires its primary weapon (DiskLaser) while staying over the
                // drain building, matching vanilla YR behavior. This handles
                // the case where the player right-clicks a nearby enemy (unit
                // or building) while the disc is draining.
                // NOTE: drainable flag is NOT checked here — even drainable
                // buildings in primary range should not force detach; the disc
                // can fire its laser at them while keeping the current drain.
                // Only targets that are out of range (requiring movement) or
                // AttackTask completion cause detach.
                if (ct && ct.obj && ct.obj !== target) {
                  var pw = e.primaryWeapon;
                  if (pw && !pw.rules.drainWeapon) {
                    var ctTile = ct.obj.isBuilding && ct.obj.isBuilding()
                      ? ct.obj.centerTile
                      : ct.obj.tile || ct.tile;
                    var dx = e.tile.rx - ctTile.rx, dy = e.tile.ry - ctTile.ry;
                    if (Math.sqrt(dx * dx + dy * dy) <= pw.range) {
                      // In primary weapon range — keep draining, the AttackTask
                      // fires the primary weapon at the manual target without
                      // moving the disc (MoveInWeaponRangeTask stops immediately
                      // via mid-flight range check).
                      return;
                    }
                  }
                  // New target is out of primary range or drainable → detach
                  // and let the disc move toward it.
                  this._detach(t);
                  return;
                }
                // No currentTarget (AttackTask ended/cancelled). This happens when
                // a manually-targeted enemy dies — the AttackTask completes and
                // clears currentTarget. Instead of immediately detaching, check
                // if the drain target is still valid and the disc hasn't moved.
                // If so, keep draining and let the passive acquisition in
                // AttackTrait re-target the drain building on the next scan tick.
                if (target && !target.isDisposed && !target.isDestroyed && target.owner !== e.owner && !t.areFriendly(target, e)) {
                  // Only keep draining if the disc is still over the drain building's
                  // centerTile. If the disc was given a move order, it will move away
                  // on the next tick and this check will fail → detach.
                  var drainCt = target.centerTile;
                  if (drainCt && e.tile.rx === drainCt.rx && e.tile.ry === drainCt.ry) {
                    target.drainedBy = e;
                    return;
                  }
                }
                this._detach(t);
                return;
              }
              // Keep the suppression flag fresh while we are still above it.
              target.drainedBy = e;
              // Money siphon (refinery / slave miner only). Vanilla: DrainMoneyAmount every
              // DrainMoneyFrameDelay ticks. No-op if the global config is unset/zero.
              var cd = t.rules.combatDamage;
              if (target.rules.refinery && cd && cd.drainMoneyAmount > 0 && cd.drainMoneyFrameDelay > 0) {
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
              // OpenYRWeb: while draining, auto-fire the primary weapon (laser) at nearby
              // enemies within range. The disc stays parked over the drain target and
              // independently engages hostile units — just like in vanilla YR.
              this._autoFirePrimary(e, t);
            }
            // OpenYRWeb: auto-fire the primary weapon (laser) at nearby enemies while draining,
            // using the game's passive target acquisition system (same as standby/guard mode).
            // Runs at most once every 10 ticks to keep CPU cost reasonable.
            _autoFirePrimary(e, t) {
              if (!this.draining || !this.drainTarget) return;
              if (0 < this.primaryScanCooldown) { this.primaryScanCooldown--; return; }
              this.primaryScanCooldown = 10;
              var primaryWp = e.primaryWeapon;
              if (!primaryWp || primaryWp.getCooldownTicks() > 0) return;
              if (!e.attackTrait) return;
              // Use the game's standard passive scanning (same as AttackTrait standby/guard mode)
              // instead of a brute-force tile loop. This properly uses threat scoring, weapon
              // selection, spatial indexing (technosByTile), and all standard targeting filters.
              var scanResult = e.attackTrait.scanForTarget(e, primaryWp, t);
              if (scanResult && scanResult.target && scanResult.target !== this.drainTarget) {
                primaryWp.fire(t.createTarget(scanResult.target, scanResult.target.tile), t, 1);
              }
            }
            // If the drained building is destroyed, stop draining.
            [d.NotifyDestroy.onDestroy](e, t, i) {
              if (this.drainTarget && (e === this.drainTarget || t?.obj === this.drainTarget)) this._detach(i);
            }
            [r.NotifyUnspawn.onUnspawn](e, t) {
              // disc died / was removed → release the building
              this._detach(t);
            }
          }),
        );
      },
    };
  },
);
