// === Reconstructed SystemJS module: game/gameobject/trait/RobotControlTrait ===
// deps: ["game/gameobject/trait/interface/NotifyTick","game/gameobject/common/DeathType","game/gameobject/unit/ZoneType","game/Coords","game/event/EventType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/RobotControlTrait",
  [
    "game/gameobject/trait/interface/NotifyTick",
    "game/gameobject/common/DeathType",
    "game/gameobject/unit/ZoneType",
    "game/Coords",
    "game/event/EventType",
  ],
  function (e, t) {
    "use strict";
    var i, r, a, n, s;
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
          a = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        // OpenYRWeb: Robot Control Center (GACSPH) / Robot Tank (ROBOT) symbiosis.
        //
        // In vanilla YR the Robot Tank has Powered=yes and its operation depends on the
        // Robot Control Center building (GACSPH). When the control center is destroyed,
        // sold, or the player goes low-power (which disables the GACSPH building itself),
        // ALL robot tanks immediately paralyze: they cannot move or attack. If a tank is
        // on water when paralyzed, it sinks and is destroyed (loses buoyancy).
        //
        // When the control center is rebuilt or power is restored, paralyzed tanks
        // reactivate. Visually, paralyzed tanks darken and emit electric sparks.
        //
        // This trait is attached to any vehicle whose rules.powered === true AND whose
        // prerequisite list includes a "control center" building. For now only ROBOT
        // qualifies (prerequisite GACSPH). The trait scans the owner's buildings each
        // tick for an operational prerequisite building (BuildStatus.Ready = 1 AND
        // poweredTrait.isPoweredOn()). If none found -> paralyzed.
        //
        // Paralysis is implemented by setting moveTrait.setDisabled() and
        // attackTrait.setDisabled() to true/false. Both traits short-circuit their
        // onTick when disabled (MoveTrait stays Idle, AttackTrait returns early).
        //
        // BuildStatus numeric check: 0=BuildUp, 1=Ready, 2=BuildDown.
        e(
          "RobotControlTrait",
          (class {
            constructor(e) {
              this.obj = e;
              this.paralyzed = !1;
              this.wasParalyzed = !1;
              this.spawnGameTick = -1; // Set on first onTick to track spawn grace period.
              // Landing animation state.
              this.landing = !1;
              this.landStartTick = 0;
              this.landDuration = 30;
              this.landStartElevation = 0;
              this.landBodyStartDir = 0;
              this.landBodyPhase1Total = 0;  // deg of rotation in phase 1
              this.landTurretStartDir = 0;
              this.landTurretPhase1Total = 0; // deg of rotation in phase 1 (> body)
              this.landTurretPhase2Target = 0; // cardinal dir for turret settle
              // Rising animation state (restoring power).
              this.rising = !1;
              this.riseStartTick = 0;
              this.riseDuration = 20;
              this.riseStartElevation = 0;
              this.riseEndElevation = 0;
              // Cache HoverBobTrait reference at construction time (HoverBobTrait is added
              // to cachedTraits.tick before RobotControlTrait in the Vehicle factory flow).
              this.hbTrait = null;
              if (e && e.cachedTraits) {
                for (var _hbi = 0; _hbi < e.cachedTraits.tick.length; _hbi++) {
                  var _hbc = e.cachedTraits.tick[_hbi];
                  if (_hbc.disabled !== void 0 && _hbc.computeHoverBobLeptons) {
                    this.hbTrait = _hbc;
                    break;
                  }
                }
              }
            }
            // Returns true if the player owns at least one operational control-center
            // building (a building with powersUnit matching this unit's name that is
            // Ready and powered on). In vanilla YR, e.g. GAROBO has PowersUnit=ROBO
            // and ROBO has PoweredUnit=yes — the tank is paralyzed when no matching
            // building is operational. This uses the PowersUnit/PoweredUnit INI pair
            // rather than Prerequisite, because Prerequisite may include production
            // buildings (e.g. GAWEAP) that are unrelated to power supply.
            hasOperationalControlCenter() {
              var e = this.obj;
              if (!e || !e.owner) return !1;
              var unitName = e.rules.name;
              if (!unitName) return !1;
              for (var b of e.owner.buildings) {
                if (b.buildStatus !== 1) continue;
                if (b.rules.powersUnit !== unitName) continue;
                var pt = b.poweredTrait;
                if (!pt || pt.isPoweredOn()) return !0;
              }
              return !1;
            }
            isParalyzed() {
              return this.paralyzed;
            }
            // Returns true if the unit's current tile overlaps with any factory building's footprint.
            // This prevents paralysis during the deployTime window before ExitFactoryTask is assigned.
            isUnitOnFactoryTile(e, t) {
              if (!e.owner || !e.tile) return !1;
              for (var b of e.owner.buildings) {
                if (!b.factoryTrait || b.buildStatus !== 1) continue;
                if (t.map.tileOccupation.isTileOccupiedBy(e.tile, b)) return !0;
              }
              return !1;
            }
            [i.NotifyTick.onTick](e, t) {
              // Skip if destroyed or not a vehicle.
              if (!e || e.isDestroyed || !e.isVehicle()) return;
              // Never paralyze while the unit is still exiting the factory (ExitFactoryTask active).
              // Also skip if the unit is on a factory building tile (deployTime delays ExitFactoryTask).
              var curTask = e.unitOrderTrait?.getCurrentTask?.();
              if ((curTask && curTask.factory) || this.isUnitOnFactoryTile(e, t)) {
                this.paralyzed = !1;
                this.wasParalyzed = !1;
                var mt = e.moveTrait;
                mt && mt.setDisabled(!1);
                var at = e.attackTrait;
                at && at.setDisabled(!1);
                return;
              }
              var operational = this.hasOperationalControlCenter();
              this.paralyzed = !operational;
              var hbTrait = this.hbTrait;
              // ── Paralyzed → disable move/attack immediately ──
              if (this.paralyzed) {
                var mt = e.moveTrait;
                mt && mt.setDisabled(!0);
                var at = e.attackTrait;
                at && at.setDisabled(!0);
                // ── Water sink check ──
                if (!this.wasParalyzed && e.zone === a.ZoneType.Water && e.isSinker) {
                  e.deathType = r.DeathType.Sink;
                  t.destroyObject(e, void 0, !0);
                  return;
                }
                // ── Start landing animation (first paralyzed frame) ──
                if (!this.wasParalyzed) {
                  this.landing = !0;
                  this.landStartTick = t.currentTick;
                  this.landDuration = Math.floor(30 + 30 * Math.random()); // 30-60 frames (~0.5-1s at 60fps)
                  this.landStartElevation = e.position.tileElevation;
                  this.landBodyStartDir = e.direction;
                  // Phase 1: body + turret rotate in the same direction (CW or CCW).
                  // Body: 180-350° (not exceeding 360°). Turret: only 10-30° more than body.
                  var isCW = Math.random() > 0.5;
                  var bodyRot = Math.floor(180 + 170 * Math.random());   // 180-349°
                  this.landBodyPhase1Total = isCW ? bodyRot : -bodyRot;
                  var turretExtra = Math.floor(10 + 21 * Math.random()); // 10-30°
                  this.landTurretPhase1Total = isCW
                    ? bodyRot + turretExtra
                    : -(bodyRot + turretExtra);
                  // Phase 2: turret settles to a cardinal direction in the REVERSE
                  // direction from phase 1, with at least 90° rotation (so visible).
                  if (e.turretTrait) {
                    this.landTurretStartDir = e.turretTrait.facing;
                    var p1End = ((this.landTurretStartDir + this.landTurretPhase1Total) % 360 + 360) % 360;
                    var phase1WasCW = this.landTurretPhase1Total > 0;
                    var validTargets = [];
                    for (var di = 0; di < 4; di++) {
                      var candidate = [0, 90, 180, 270][di];
                      var d = candidate - p1End;
                      while (d > 180) d -= 360;
                      while (d < -180) d += 360;
                      // Must be reverse direction from phase 1, and at least 90°.
                      var isReverse = phase1WasCW ? d < 0 : d > 0;
                      isReverse && Math.abs(d) >= 90 && validTargets.push(candidate);
                    }
                    this.landTurretPhase2Target = validTargets[Math.floor(Math.random() * validTargets.length)];
                  }
                  e.spinVelocity = 0;
                }
                // ── Two-phase landing animation ──
                if (this.landing) {
                  var rawProgress = Math.min(1, (t.currentTick - this.landStartTick) / this.landDuration);
                  var eased = 1 - (1 - rawProgress) * (1 - rawProgress); // ease-out quad for elevation
                  // Elevation: descends across BOTH phases (full duration).
                  e.position.tileElevation = this.landStartElevation * (1 - eased);
                  if (rawProgress < 0.5) {
                    // ── Phase 1: body + turret spin in same direction (turret goes further) ──
                    var p1 = rawProgress * 2; // 0→0, 0.5→1
                    e.direction = ((this.landBodyStartDir + this.landBodyPhase1Total * p1) % 360 + 360) % 360;
                    if (e.turretTrait) {
                      e.turretTrait.facing = ((this.landTurretStartDir + this.landTurretPhase1Total * p1) % 360 + 360) % 360;
                      e.turretTrait.desiredFacing = e.turretTrait.facing;
                    }
                  } else {
                    // ── Phase 2: body freezes, turret reverses to cardinal dir ──
                    var p2 = (rawProgress - 0.5) * 2; // 0.5→0, 1→1
                    // Body frozen at end-of-phase-1 position.
                    e.direction = ((this.landBodyStartDir + this.landBodyPhase1Total) % 360 + 360) % 360;
                    // Turret reverses to cardinal target (shortest path, always < 180°).
                    if (e.turretTrait) {
                      var turretPhase1End = ((this.landTurretStartDir + this.landTurretPhase1Total) % 360 + 360) % 360;
                      var turretDiff = this.landTurretPhase2Target - turretPhase1End;
                      while (turretDiff > 180) turretDiff -= 360;
                      while (turretDiff < -180) turretDiff += 360;
                      e.turretTrait.facing = ((turretPhase1End + turretDiff * p2) % 360 + 360) % 360;
                      e.turretTrait.desiredFacing = e.turretTrait.facing;
                    }
                  }
                  // ── Animation complete ──
                  if (rawProgress >= 1) {
                    this.landing = !1;
                    e.direction = ((this.landBodyStartDir + this.landBodyPhase1Total) % 360 + 360) % 360;
                    if (e.turretTrait) {
                      e.turretTrait.facing = this.landTurretPhase2Target;
                      e.turretTrait.desiredFacing = this.landTurretPhase2Target;
                    }
                    if (hbTrait) hbTrait.disabled = !0;
                  }
                } else {
                  // Already landed — force ground elevation every frame to prevent any hover bob.
                  hbTrait && (hbTrait.disabled = !0);
                  e.position.tileElevation = 0;
                }
              } else {
                // ── Not paralyzed — restore ──
                // Handle transition from paralyzed → restored.
                if (this.wasParalyzed) {
                  // Just restored — start rising animation (float up from ground).
                  this.rising = !0;
                  this.riseStartTick = t.currentTick;
                  this.riseDuration = Math.floor(30 + 30 * Math.random()); // 30-60 frames (~0.5-1s at 60fps)
                  this.riseStartElevation = e.position.tileElevation;
                  this.landing = !1; // Cancel any in-progress landing.
                  // Calculate target hover elevation.
                  var brH = e.onBridge
                    ? (t.map.tileOccupation.getBridgeOnTile(e.tile)?.tileElevation ?? 0)
                    : 0;
                  this.riseEndElevation =
                    brH + n.Coords.worldToTileHeight(t.rules.general.hover.height);
                }
                if (this.rising) {
                  var riseProgress = Math.min(1, (t.currentTick - this.riseStartTick) / this.riseDuration);
                  var riseEased = 1 - (1 - riseProgress) * (1 - riseProgress); // ease-out quad
                  e.position.tileElevation =
                    this.riseStartElevation +
                    (this.riseEndElevation - this.riseStartElevation) * riseEased;
                  // Keep HoverBobTrait disabled while we animate the rise manually.
                  if (hbTrait) hbTrait.disabled = !0;
                  // Don't restore move/attack until fully risen.
                  var mtr = e.moveTrait;
                  mtr && mtr.setDisabled(!0);
                  var atr = e.attackTrait;
                  atr && atr.setDisabled(!0);
                  // ── Rise complete ──
                  if (riseProgress >= 1) {
                    this.rising = !1;
                    e.position.tileElevation = this.riseEndElevation;
                    if (hbTrait) {
                      hbTrait.disabled = !1;
                      hbTrait.prevHoverBobLeptons = hbTrait.computeHoverBobLeptons(t.currentTick, t.rules.general.hover);
                      hbTrait.spawnTick = t.currentTick;
                      hbTrait.setBaseElevation(e, t);
                    }
                    mtr && mtr.setDisabled(!1);
                    atr && atr.setDisabled(!1);
                  }
                } else {
                  // Already floating — ensure HoverBobTrait is active.
                  if (hbTrait && hbTrait.disabled) {
                    hbTrait.disabled = !1;
                    hbTrait.prevHoverBobLeptons = hbTrait.computeHoverBobLeptons(t.currentTick, t.rules.general.hover);
                    hbTrait.spawnTick = t.currentTick;
                    hbTrait.setBaseElevation(e, t);
                  }
                  var mT = e.moveTrait;
                  mT && mT.setDisabled(!1);
                  var aT = e.attackTrait;
                  aT && aT.setDisabled(!1);
                }
                this.landing = !1;
              }
              // Fire event when paralysis state changes (for SoundHandler to play ActivateSound/DeactivateSound).
              if (this.paralyzed !== this.wasParalyzed) {
                t.events.dispatch({
                  type: s.EventType.RobotPowerStateChange,
                  gameObject: e,
                  activated: !this.paralyzed
                });
              }
              this.wasParalyzed = this.paralyzed;
            }
            dispose() {
              this.obj = void 0;
            }
          }),
        );
      },
    };
  },
);
