// === Reconstructed SystemJS module: game/gameobject/task/MagnetronDragTask ===
// deps: ["game/gameobject/task/system/Task","game/map/tileFinder/RadialTileFinder","game/type/LocomotorType","game/Coords","game/math/Vector2","game/math/Vector3","game/gameobject/unit/ZoneType","game/gameobject/trait/MoveTrait","game/gameobject/task/move/MoveTask","game/event/ObjectLandEvent","game/event/ObjectLiftOffEvent","game/gameobject/common/DeathType","game/type/LandType","game/type/SpeedType","game/gameobject/locomotor/JumpjetLocomotor","game/Warhead"]
// Note: variable/type names are minified approximations of the original TypeScript.
//
// OpenYRWeb: Magnetron (TELE) magnetic-beam lift — vanilla YR-equivalent, self-contained.
//
// Vanilla YR behavior (REVERSED from yrmd.exe — see re/NOTES.md §3.5/§4, 2026-06-30):
//   - MagneticBeam's LocomotorBeam warhead (IsLocomotor=yes, Locomotor=Jumpjet CLSID) lifts the
//     target vehicle into the air and pulls it toward the firing Magnetron at jumpjet cruise
//     height. The beam must keep firing to sustain the lift.
//   - When the Magnetron stops firing (out of range / re-targets / dies / moves / suppressed /
//     chrono'd), the victim FALLS from wherever it currently is.
//   - On landing, vanilla yrmd.exe runs TWO damage mechanisms (both verified by decompilation):
//       (B) The techno BELOW is crushed: TechnoClass::TakeDamage is called with the CrushWarhead
//           (Rules+0xfac) for damage = the falling unit's raw Strength. NO faction filter — the
//           occupant is found purely by cell-occupancy (whatever is on the landing tile), so a
//           lifted enemy vehicle dropped onto its OWN faction's building crushes it.  @ FUN_0054ca90
//       (A) The falling unit itself takes Strength (or current HP if CurrentStrengthDamage) ×
//           FallingDamageMultiplier via the dedicated FallingDamage warhead (Rules+0xfa8).
//           @ FUN_0041bc30 (FootClass::Crash/Fall handler, gate flag +0x6a5 "is falling")
//     Earlier OpenYRWeb code WRONGLY added `if (game.areFriendly(target, victim)) continue;`
//     here — that had NO vanilla basis and was the root cause of the "drop on enemy building
//     deals no damage" bug. It has been removed.
//   - While lifted (zone=Air) the victim can only be attacked by AA weapons (e.g. Gattling Tank's
//     AAGattling) and cannot fire back (AttackTrait.scanForTarget early-returns on magnetronDraggedBy).
//
// Implementation (self-contained — does NOT spawn a MoveTask child):
//   Earlier versions pushed a MoveTask child to fly the victim, but (a) TaskRunner suppresses a
//   parent's onTick while a blocking child runs (so drop detection was dormant during flight), and
//   (b) starting a MoveTask on a mid-move victim throws "Nested move tasks". This version drives
//   the victim's position DIRECTLY every tick (climb to cruise height + drift toward the Magnetron
//   while beaming; descend in place once the beam stops), so there is no child task, no TaskRunner
//   blocking, and no nested-move hazard. MoveTrait.NotifyTick is kept inert by leaving
//   moveTrait.moveState = Idle (its reset guard at MoveTrait.ts.js:142 only fires when
//   moveState !== Idle), so it never clobbers our direct position edits.
//   The shared per-type TechnoRules is NEVER mutated (Rules.getObject returns a shared cached
//   instance); only per-instance moveTrait fields are touched.

System.register(
  "game/gameobject/task/MagnetronDragTask",
  [
    "game/gameobject/task/system/Task",
    "game/map/tileFinder/RadialTileFinder",
    "game/type/LocomotorType",
    "game/Coords",
    "game/math/Vector2",
    "game/math/Vector3",
    "game/gameobject/unit/ZoneType",
    "game/gameobject/trait/MoveTrait",
    "game/gameobject/task/move/MoveTask",
    "game/event/ObjectLandEvent",
    "game/event/ObjectLiftOffEvent",
    "game/gameobject/common/DeathType",
    "game/type/LandType",
    "game/type/SpeedType",
    "game/gameobject/locomotor/JumpjetLocomotor",
    "game/Warhead",
  ],
  function (e, t) {
    "use strict";
    var s, r, lt, C, V2, V3, Z, MT, MV, OLE, OLFE, DT, LL, SP, JJ, WH;
    t && t.id;
    return {
      setters: [
        function (e) { s = e; },
        function (e) { r = e; },
        function (e) { lt = e; },
        function (e) { C = e; },
        function (e) { V2 = e; },
        function (e) { V3 = e; },
        function (e) { Z = e; },
        function (e) { MT = e; },
        function (e) { MV = e; },
        function (e) { OLE = e; },
        function (e) { OLFE = e; },
        function (e) { DT = e; },
        function (e) { LL = e; },
        function (e) { SP = e; },
        function (e) { JJ = e; },
        function (e) { WH = e; },
      ],
      execute: function () {
        var n;
        // No beam refresh for this many ticks => Magnetron stopped firing => drop the victim.
        // ~2x a typical YR weapon ROF (MagneticBeam ROF=20 in vanilla) => ~40 ticks.
        var BEAM_TIMEOUT = 40;
        // Lift physics, mirroring JumpjetControls defaults (rulesmd.ini) and per-unit jumpjet*.
        var CRUISE_HEIGHT = 500; // leptons above ground (JumpjetControls CruiseHeight)
        var CLIMB_RATE = 5;      // leptons/tick (JumpjetControls Climb)
        var HORIZ_SPEED = 14;    // leptons/tick drift toward the Magnetron (JumpjetControls Speed)
        e(
          "MagnetronDragTask",
          (n = class extends s.Task {
            // game, victim (dragged vehicle), magnetron (firing unit we drag toward),
            // warhead (the LocomotorBeam Warhead instance, used to apply drop crush damage).
            constructor(e, t, i, warhead) {
              super(),
                (this.game = e),
                (this.victim = t),
                (this.magnetron = i),
                (this.warhead = warhead),
                (this._tickCount = 0),
                (this._lastBeamTick = 0),
                (this._dropped = !1),
                // safety cap (~20s). If exceeded while still airborne, onEnd force-lands.
                (this._maxTicks = 300),
                ((this.cancellable = !0), (this.blocking = !0), (this.preventOpportunityFire = !0));
            }
            // Called by Warhead._dragVehicleTo on each MagneticBeam hit while this task runs.
            // Keeps the beam "alive" — if not refreshed within BEAM_TIMEOUT, the victim drops.
            refreshBeam(currentTick) {
              this._lastBeamTick = currentTick;
            }
            onStart(unit) {
              var v = this.victim;
              if (!v || v.isDisposed || v.isDestroyed) { this._aborted = !0; return; }
              if (!v.moveTrait || !v.unitOrderTrait) { this._aborted = !0; return; }
              if (v.magnetronDraggedBy) { this._aborted = !0; return; }
              // OpenYRWeb: the victim stays in zone=Ground for TARGETING purposes. Flipping it to
              // zone=Air would make the Magnetron's ground-only MagneticBeam weapon unable to
              // re-acquire the victim (WeaponTargeting.canTargetZone returns false for zone=Air
              // without AA), which would terminate the Magnetron's AttackTask within one tick
              // (AttackTask self-ends at PrepareToFire when !canTarget) and instantly drop the
              // victim. Keeping zone=Ground lets the Magnetron keep firing every ROF → each hit
              // re-detonates LocomotorBeam → Warhead._dragVehicleTo → refreshBeam, sustaining the
              // lift. The "can't fire back" effect is already enforced by the magnetronDraggedBy
              // flag (AttackTrait.scanForTarget early-returns). The hover is purely visual, done
              // via the victim's elevation (setAbsoluteElevationWorld), not its zone.
              v.magnetronDraggedBy = this.magnetron;
              // OpenYRWeb reverse-link so the Magnetron's renderable can draw a continuous
              // tractor beam toward the victim (MagnetronBeamPlugin reads this).
              this.magnetron.magnetronDragging = v;
              // Keep MoveTrait inert so it never fights our direct position edits: leave
              // moveState = Idle (its reset guard at MoveTrait.ts.js:142 only fires when
              // moveState !== Idle) and drop any residual locomotor/velocity.
              try {
                v.moveTrait.locomotor = void 0;
                v.moveTrait.moveState = MT.MoveState.Idle;
                v.moveTrait.velocity && v.moveTrait.velocity.set(0, 0, 0);
              } catch (err) {}
              // Prime the beam timer so the first BEAM_TIMEOUT window counts from spawn.
              this._lastBeamTick = this.game.currentTick;
            }
            onTick(unit) {
              if (this._aborted) return !0;
              var v = this.victim;
              if (!v || v.isDisposed || v.isDestroyed) return !0;
              if (++this._tickCount > this._maxTicks) return !0;
              // Release conditions (vanilla: the beam must keep firing to sustain the lift):
              //   - Magnetron gone (destroyed/sold/captured/limboed) → drop immediately.
              //   - No refreshBeam for BEAM_TIMEOUT ticks → the Magnetron stopped firing
              //     (out of range / S-stop / move order / re-target / suppressed) → drop.
              var mag = this.magnetron;
              var magGone = !mag || mag.isDisposed || mag.isDestroyed;
              var beamStale = this.game.currentTick - this._lastBeamTick > BEAM_TIMEOUT;
              if (magGone || beamStale) {
                // Beam stopped → drop the victim IN PLACE (no more horizontal pull).
                return this._descend(v);
              }
              // Beam active: climb to cruise height and drift horizontally toward the Magnetron.
              this._liftAndDrag(v, mag);
              return !1;
            }
            // While beaming: raise the victim to CRUISE_HEIGHT and pull it horizontally toward the
            // Magnetron's position (vanilla YR drags the lifted vehicle toward the firer). All
            // movement is done by directly editing the victim's position so no MoveTask/locomotor
            // is involved (avoids nested-move and TaskRunner-blocking pitfalls).
            _liftAndDrag(v, mag) {
              var pos = v.position;
              var beforeTile = v.tile; // capture BEFORE moveByLeptons3 mutates position._tile
              var worldY = pos.worldPosition.y;
              // Ground-level world Y at the victim's current tile (+bridge), the baseline we climb from.
              var groundY = this._groundWorldY(v);
              var targetY = groundY + CRUISE_HEIGHT;
              var dy = 0;
              if (worldY < targetY) dy = Math.min(CLIMB_RATE, targetY - worldY);
              // Horizontal vector toward the Magnetron (only drift once substantially airborne,
              // matching the "lift then pull" feel). Stop short of actually overlapping the firer.
              var dx = 0,
                dz = 0;
              if (worldY >= groundY + CRUISE_HEIGHT * 0.5 && mag && mag.position) {
                var vp = pos.getMapPosition();
                var mp = mag.position.getMapPosition();
                var hx = mp.x - vp.x,
                  hz = mp.y - vp.y;
                var hlen = Math.hypot(hx, hz);
                // Keep ~1 tile of separation from the Magnetron so the victim hovers beside it.
                var want = Math.max(0, hlen - C.Coords.LEPTONS_PER_TILE);
                var step = Math.min(HORIZ_SPEED, want);
                if (hlen > 0.001 && step > 0) {
                  dx = (hx / hlen) * step;
                  dz = (hz / hlen) * step;
                }
              }
              // Apply the 3D delta. moveByLeptons3 moves XZ by leptons and sets absolute world-Y.
              try {
                pos.moveByLeptons3(new V3.Vector3(dx, dy, dz));
              } catch (err) {}
              // Re-sync the victim's tile occupation as it drifts horizontally.
              this._syncTile(v, beforeTile);
            }
            // Drop phase: lower the victim straight down to the ground at its CURRENT tile (vanilla
            // drops in place once the beam stops). We lower the victim's elevation directly each
            // tick (CLIMB_RATE leptons/tick downward) until it reaches ground level, then apply
            // drop crush damage and finish. We keep zone=Ground throughout (the victim was never
            // flipped to Air — see onStart), so we cannot reuse JumpjetLocomotor.tickStationary
            // (it no-ops unless zone=Air).
            _descend(v) {
              if (this._dropped) return !0;
              var pos = v.position;
              var groundY = this._groundWorldY(v);
              var worldY = pos.worldPosition.y;
              if (worldY > groundY + 0.5) {
                // Still airborne (elevated) → step down toward the ground this tick.
                var step = Math.min(CLIMB_RATE, worldY - groundY);
                try {
                  pos.setAbsoluteElevationWorld(worldY - step);
                } catch (err) {}
                return !1;
              }
              // Touched down → apply drop crush damage (once), then finish.
              try { pos.setAbsoluteElevationWorld(groundY); } catch (err) {}
              this._dropped = !0;
              this._applyDrop(v, this.game);
              return !0;
            }
            // World-Y of the ground at the victim's tile (tile.z + bridge), in world units.
            _groundWorldY(v) {
              var t = v.tile;
              var z = t ? t.z : 0;
              return C.Coords.tileHeightToWorld(z);
            }
            // Keep the victim registered on its current tile as it drifts (re-occupy on tile change).
            _syncTile(v, beforeTile) {
              try {
                var after = v.tile;
                if (beforeTile && after && (beforeTile.rx !== after.rx || beforeTile.ry !== after.ry)) {
                  this.game.map.tileOccupation.unoccupyTileRange(beforeTile, v);
                  this.game.map.tileOccupation.occupyTileRange(after, v);
                  this.game.map.technosByTile && this.game.map.technosByTile.updateObject(v);
                }
              } catch (err) {}
            }
            // OpenYRWeb: vanilla Magnetron drop crush damage — REVERSED from yrmd.exe
            // (see re/NOTES.md §3.5/§4, 2026-06-30).
            //
            // On landing, vanilla runs two damage mechanisms (both decompiled & verified):
            //   (B) Whatever techno is BELOW (cell-occupancy of the landing tile) is crushed via
            //       CrushWarhead (Rules+0xfac) for damage = the falling unit's raw Strength.
            //       @ FUN_0054ca90 — TechnoClass::TakeDamage(vtable+0x16c)(occupant, ...,
            //       Rules+0xfac /*CrushWarhead*/, strength, ...). NO faction filter.
            //   (A) The falling unit itself takes Strength (or current HP if CurrentStrengthDamage)
            //       × FallingDamageMultiplier via the dedicated FallingDamage warhead (Rules+0xfa8).
            //       @ FUN_0041bc30 (FootClass crash/fall handler, gate this+0x6a5 "is falling").
            //
            // CRITICAL FIX (was the reported bug): there is NO friendly/foe filter in vanilla —
            // the occupant is found purely by cell-occupancy. The earlier `if (areFriendly(target,
            // victim)) continue;` had no basis in the binary and caused "drop on enemy building
            // deals no damage" (the victim's own faction owns that building → skipped → no crush).
            //
            // We mirror vanilla: query the landing tile's GROUND occupants (vanilla's cell-occupancy
            // is the ground layer — it never crushes an aircraft that happens to be flying over the
            // cell), apply the crush via the CrushWarhead so armor/Verses are respected, then damage
            // the falling victim itself for its strength × FallingDamageMultiplier.
            _applyDrop(victim, game) {
              try {
                if (!victim || victim.isDisposed || victim.isDestroyed || !victim.healthTrait) return;
                var cd = game.rules && game.rules.combatDamage;
                // Damage = falling unit's Strength (max) or current HP, per CurrentStrengthDamage.
                var useCurrent = !cd || cd.currentStrengthDamage !== !1;
                var base = useCurrent
                  ? victim.healthTrait.getHitPoints()
                  : victim.healthTrait.maxHitPoints;
                var mult = cd && cd.fallingDamageMultiplier != null ? cd.fallingDamageMultiplier : 1;
                var fallDmg = Math.max(1, Math.round(base * mult));
                // Mechanism B: crush every GROUND techno occupying the landing tile. vanilla uses
                // ground cell-occupancy with no faction filter, so we do the same. getGroundObjectsOnTile
                // excludes airborne non-building units (so a Rocketeer passing overhead isn't crushed)
                // but includes buildings (multi-tile footprints register on every foundation tile, so a
                // victim landing on any tile of a 3x3 building finds that building here).
                var targets = [];
                try {
                  var onTile = game.map.tileOccupation.getGroundObjectsOnTile(victim.tile) || [];
                  for (var oi = 0; oi < onTile.length; oi++) {
                    var o = onTile[oi];
                    if (!o || o === victim || o.isDestroyed) continue;
                    if (!o.isTechno || !o.isTechno()) continue;
                    if (!o.healthTrait) continue;
                    // No areFriendly filter — vanilla applies crush to ALL occupants (friend/foe/neutral).
                    targets.push(o);
                  }
                } catch (err) {}
                if (targets.length) {
                  // Crush each occupant via CrushWarhead (Rules+0xfac), damage = victim's Strength.
                  // Building the Warhead follows the TntChargeTrait.detonateIvanWarhead idiom.
                  var crushWhName = (cd && cd.crushWarhead) || "Crush";
                  var crushWh = void 0;
                  try {
                    var whRules = game.rules.getWarhead(crushWhName);
                    if (whRules) crushWh = new WH.Warhead(whRules);
                  } catch (err) {}
                  var victimStrength = victim.healthTrait.maxHitPoints;
                  var attackerInfo = { obj: victim, player: victim.owner, weapon: void 0 };
                  for (var ti = 0; ti < targets.length; ti++) {
                    var target = targets[ti];
                    try {
                      if (target.isInfantry && target.isInfantry())
                        target.infDeathType = 0; // InfDeathType.None — vanilla clears infantry death anim on crush
                      target.deathType = DT.DeathType.Crush;
                      if (crushWh && crushWh.computeDamage && crushWh.inflictDamage) {
                        // Armored path (respects Verses/armor), mirroring vanilla TakeDamage.
                        var reduced = crushWh.computeDamage(victimStrength, target, game);
                        crushWh.inflictDamage(reduced, target, attackerInfo, game);
                      } else {
                        // Fallback: raw damage + destroy (matches MoveTrait crush idiom).
                        target.healthTrait.inflictDamage(victimStrength, attackerInfo, game);
                        if (
                          (target.healthTrait && target.healthTrait.getHitPoints() <= 0) ||
                          target.isDestroyed
                        )
                          game.destroyObject(target, attackerInfo);
                      }
                    } catch (err) {}
                  }
                  // Mechanism A: the falling vehicle itself takes fall damage. vanilla routes this
                  // through the dedicated falling-damage warhead (Rules+0xfa8, the C4Warhead) inside
                  // FUN_0041bc30 (FootClass crash handler). OpenYRWeb has no C4Warhead-as-falling-
                  // damage wiring, so we apply the computed fallDmg directly to the victim's HP
                  // (raw — the crush knob already scales it via FallingDamageMultiplier). The victim
                  // almost always dies here (fallDmg ≈ its own HP), matching vanilla's "fall
                  // vertically ... being destroyed itself" outcome.
                  if (!victim.isDestroyed && victim.healthTrait) {
                    try {
                      victim.deathType = DT.DeathType.Crush;
                      victim.healthTrait.inflictDamage(fallDmg, { obj: void 0 }, game);
                      if (
                        (victim.healthTrait && victim.healthTrait.getHitPoints() <= 0) ||
                        victim.isDestroyed
                      )
                        game.destroyObject(victim, { obj: void 0 });
                    } catch (err) {}
                  }
                  return;
                }
                // No techno below. Non-amphibious vehicle dropped over water is destroyed (vanilla).
                if (
                  victim.tile.landType === LL.LandType.Water &&
                  victim.rules.speedType !== SP.SpeedType.Amphibious
                ) {
                  try {
                    victim.deathType = DT.DeathType.Sink;
                    game.destroyObject(victim, { obj: void 0 });
                  } catch (err) {}
                  return;
                }
                // Clear ground => normal safe landing, no damage (vanilla behavior).
              } catch (err) {
                // Never let drop-damage accounting tear down the tick driver.
              }
            }
            onEnd(unit) {
              var v = this.victim;
              if (!v || v.isDisposed || v.isDestroyed) {
                this._aborted && (this._aborted = !1);
                return;
              }
              // The victim was never flipped to zone=Air; it only had its elevation raised for the
              // hover. If the task ends while it is still elevated (safety cap / magnetron death),
              // snap it back to ground level so it is never left visually floating.
              try {
                if (v.position) {
                  var groundY = this._groundWorldY(v);
                  if (v.position.worldPosition.y > groundY + 0.5)
                    v.position.setAbsoluteElevationWorld(groundY);
                }
              } catch (err) {}
              // Restore the victim's per-instance move state so its own Drive locomotor is rebuilt
              // on its next real move. We never touched the shared rules.locomotor.
              if (v.moveTrait) {
                v.moveTrait.locomotor = void 0;
                v.moveTrait.moveState = MT.MoveState.Idle;
                v.moveTrait.velocity && v.moveTrait.velocity.set(0, 0, 0);
              }
              v.magnetronDraggedBy = void 0;
              // Clear the reverse-link too (only if it still points at our victim).
              if (this.magnetron && this.magnetron.magnetronDragging === v)
                this.magnetron.magnetronDragging = void 0;
              this._aborted = !1;
            }
          }),
        );
      },
    };
  },
);
