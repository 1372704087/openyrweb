// === Reconstructed SystemJS module: game/gameobject/trait/TankBunkerTrait ===
// deps: ["game/gameobject/trait/interface/NotifyTick","game/gameobject/trait/interface/NotifyDestroy","game/gameobject/trait/interface/NotifyDamage","game/gameobject/trait/interface/NotifySell","game/type/LocomotorType","game/type/SpeedType","util/math"]
//
// OpenYRWeb: Tank Bunker trait (vanilla YR Bunker=yes). Attached to buildings that have
// Bunker=yes + NumberOfDocks=1. Works alongside DockTrait — the vehicle physically drives
// onto the dock tile and stays visible (unlike infantry garrison which limboes the unit).
//
// Core behaviours:
//   1. Damage redirection — when a vehicle inside the bunker is attacked, the damage is
//      absorbed by the bunker building instead (unless the warhead has PenetratesBunker=yes).
//   2. Weapon bonuses — the bunkered vehicle gets BunkerDamageMultiplier, BunkerROFMultiplier,
//      and BunkerWeaponRangeBonus applied to its weapons.
//   3. Entry validation — only ground vehicles (Locomotor=Vehicle) with Bunkerable=yes, a
//      turret or OmniFire weapon, and a primary weapon can enter. Harvesters, Battle
//      Fortresses, and Masterminds are excluded by their Size/Weight.
//   4. Parasite protection — Terror Drones cannot infest a vehicle inside a Tank Bunker.
//   5. Evacuation — when the bunker is sold or destroyed, the vehicle is ejected.

System.register(
  "game/gameobject/trait/TankBunkerTrait",
  [
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/trait/interface/NotifyDestroy",
    "game/gameobject/trait/interface/NotifyDamage",
    "game/gameobject/trait/interface/NotifySell",
    "game/type/LocomotorType",
    "game/type/SpeedType",
    "util/math",
  ],
  function (e, t) {
    "use strict";
    var i, r, s, a, n, o, l, c;
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
        function (e) {
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
      ],
      execute: function () {
        ((c = class {
          constructor(e) {
            (this.building = e),
              // The currently bunkered vehicle (null when empty). Tracked by polling
              // DockTrait.getDockedUnits() each tick — the DockTrait handles the actual
              // docking/undocking when the vehicle enters/leaves the dock tile.
              (this.bunkeredVehicle = void 0),
              (this._prevDockedCount = 0);
          }
          // ── Entry validation ──
          // Checks whether a vehicle meets all the criteria to enter a Tank Bunker.
          // Mirrors vanilla YR rules (ModEnc/Bunkerable):
          //   - Must be a vehicle (not infantry/aircraft)
          //   - Locomotor must be Vehicle (ground) — not Hover, Fly, etc.
          //   - Bunkerable must not be no (default yes)
          //   - Must have a turret OR an OmniFire=yes weapon
          //   - Must have a primary weapon (VehicleTypes require a primary weapon)
          //   - Must not be a drone (Size=1 and too light — vanilla excludes drones)
          //   - Must not be parasited (Terror Drone on board)
          //   - Must not be too large (Battle Fortress, Mastermind — Size > SizeLimit)
          canVehicleEnter(e) {
            if (!e || !e.isVehicle()) return !1;
            // Locomotor check: only ground vehicles (Locomotor=Vehicle, GUID 4A582741...)
            if (e.rules.locomotor !== n.LocomotorType.Vehicle) return !1;
            // Bunkerable flag (default yes)
            if (e.rules.bunkerable === !1) return !1;
            // Must have a turret or OmniFire weapon
            var hasTurret = !!e.rules.turret;
            var hasOmniFire = !!e.rules.omniFire;
            if (!hasTurret && !hasOmniFire) return !1;
            // Must have a primary weapon
            if (!e.rules.primary) return !1;
            // Exclude drones (Size < 1 or considered too small). Vanilla YR checks for
            // the "Drone" identifier or small size. We use Size check: vehicles with
            // Size=0 or very small are excluded.
            if (e.rules.size < 1) return !1;
            // Exclude transport vehicles (Battle Fortress, etc.) — too large to enter.
            if (e.transportTrait) return !1;
            // Exclude parasited units (Terror Drone on board)
            if (e.parasiteableTrait && e.parasiteableTrait.isInfested()) return !1;
            // Exclude mind-controlled units
            if (e.mindControllableTrait && e.mindControllableTrait.isActive()) return !1;
            // Exclude vehicles being mind-controlled
            if (e.mindControllerTrait && e.mindControllerTrait.isActive()) return !1;
            return !0;
          }
          // ── Check if a vehicle is currently bunkered here ──
          isVehicleBunkered(e) {
            return this.bunkeredVehicle === e;
          }
          getBunkeredVehicle() {
            return this.bunkeredVehicle;
          }
          // ── Weapon bonus accessors ──
          // Called by AttackTrait/ArmedTrait when a bunkered vehicle fires.
          getDamageMultiplier() {
            return this.building.game?.rules?.combatDamage?.bunkerDamageMultiplier ?? 1;
          }
          getROFMultiplier() {
            return this.building.game?.rules?.combatDamage?.bunkerROFMultiplier ?? 1;
          }
          getRangeBonus() {
            return this.building.game?.rules?.combatDamage?.bunkerWeaponRangeBonus ?? 0;
          }
          // ── Tick: verify bunkered vehicle is still valid ──
          [i.NotifyTick.onTick]() {
            if (this.bunkeredVehicle) {
              // Vehicle was destroyed or removed while bunkered — clean up
              if (this.bunkeredVehicle.isDestroyed || this.bunkeredVehicle.isDisposed || !this.bunkeredVehicle.isSpawned) {
                this.bunkeredVehicle.bunkeredAt = void 0;
                this.bunkeredVehicle = void 0;
              }
            }
          }
          // ── Damage: evacuate when bunker is critically damaged ──
          [s.NotifyDamage.onDamage](e, t) {
            // In vanilla YR, the Tank Bunker does not auto-evacuate on damage.
            // The vehicle stays until manually ordered out or the bunker is destroyed.
          }
          // ── Destroy: eject the vehicle ──
          [r.NotifyDestroy.onDestroy](e, t, i, r) {
            if (this.bunkeredVehicle) {
              var v = this.bunkeredVehicle;
              (v.bunkeredAt = void 0, (this.bunkeredVehicle = void 0));
              // Re-enable movement on eject
              if (v.moveTrait) {
                v.moveTrait.setDisabled(!1);
              }
              if (r) {
                // Vehicle is destroyed along with the bunker (vanilla YR behaviour)
                if (!v.isDestroyed) {
                  t.destroyObject(v, i, r);
                }
              } else if (this.building.dockTrait) {
                this.building.dockTrait.undockUnit(v);
              }
            }
          }
          // ── Sell: eject the vehicle before selling ──
          [a.NotifySell.onSell](e, t) {
            if (this.bunkeredVehicle && this.building.dockTrait) {
              var v = this.bunkeredVehicle;
              (v.bunkeredAt = void 0, (this.bunkeredVehicle = void 0));
              // Re-enable movement on eject
              if (v.moveTrait) {
                v.moveTrait.setDisabled(!1);
              }
              this.building.dockTrait.undockUnit(v);
            }
          }
          getHash() {
            return l.fnv32a(this.bunkeredVehicle ? [this.bunkeredVehicle.getHash()] : []);
          }
          debugGetState() {
            return { bunkeredVehicle: this.bunkeredVehicle?.debugGetState() };
          }
          dispose() {
            this.building = void 0;
          }
        }),
          e("TankBunkerTrait", c));
      },
    };
  },
);
