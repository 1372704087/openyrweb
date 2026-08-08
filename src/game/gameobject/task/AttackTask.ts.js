// === Reconstructed SystemJS module: game/gameobject/task/AttackTask ===
// deps: ["game/gameobject/task/system/Task","game/gameobject/unit/RangeHelper","game/gameobject/task/system/WaitMinutesTask","game/WeaponType","game/gameobject/task/move/MoveInWeaponRangeTask","game/gameobject/unit/FacingUtil","game/gameobject/task/TurnTask","game/gameobject/task/system/WaitTicksTask","game/gameobject/trait/AttackTrait","game/gameobject/GameObject","game/gameobject/unit/LosHelper","game/gameobject/trait/MoveTrait","game/GameSpeed","game/Coords","engine/type/ObjectType","game/map/tileFinder/RadialTileFinder","game/gameobject/unit/MovePositionHelper","game/gameobject/unit/ZoneType","game/type/MovementZone","game/gameobject/task/system/TaskStatus","game/gameobject/task/move/MoveTask","game/math/Vector3","game/math/Vector2"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/AttackTask",
  [
    "game/gameobject/task/system/Task",
    "game/gameobject/unit/RangeHelper",
    "game/gameobject/task/system/WaitMinutesTask",
    "game/WeaponType",
    "game/gameobject/task/move/MoveInWeaponRangeTask",
    "game/gameobject/unit/FacingUtil",
    "game/gameobject/task/TurnTask",
    "game/gameobject/task/system/WaitTicksTask",
    "game/gameobject/trait/AttackTrait",
    "game/gameobject/GameObject",
    "game/gameobject/unit/LosHelper",
    "game/gameobject/trait/MoveTrait",
    "game/GameSpeed",
    "game/Coords",
    "engine/type/ObjectType",
    "game/map/tileFinder/RadialTileFinder",
    "game/gameobject/unit/MovePositionHelper",
    "game/gameobject/unit/ZoneType",
    "game/type/MovementZone",
    "game/gameobject/task/system/TaskStatus",
    "game/gameobject/task/move/MoveTask",
    "game/math/Vector3",
    "game/math/Vector2",
  ],
  function (e, t) {
    "use strict";
    var i, s, d, g, p, m, f, y, T, v, a, b, S, w, n, E, C, x, O, r, A, M, R, P, I, k, o;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          f = e;
        },
        function (e) {
          y = e;
        },
        function (e) {
          T = e;
        },
        function (e) {
          v = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          b = e;
        },
        function (e) {
          S = e;
        },
        function (e) {
          w = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          E = e;
        },
        function (e) {
          C = e;
        },
        function (e) {
          x = e;
        },
        function (e) {
          O = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          A = e;
        },
        function (e) {
          M = e;
        },
        function (e) {
          R = e;
        },
      ],
      execute: function () {
        ((P = 3),
          (k = 4 * (I = 11.25)),
          (o = class o extends i.Task {
            constructor(e, t, i, r = {}) {
              (super(),
                (this.game = e),
                (this.target = t),
                (this.weapon = i),
                (this.options = r),
                (this.moveExecuted = !1),
                (this.moveAttempts = 0),
                // OpenYRWeb: set when the crush-on-attack approach fails (target unreachable)
                // so the unit falls back to firing instead of looping forever.
                (this.crushApproachFailed = !1),
                // OpenYRWeb: crush-approach progress guard — tracks whether the crush move
                // task is actually closing the gap on a crushable target (wall). If it
                // stalls (unit parked adjacent and never driving onto the target), the
                // approach is abandoned and the unit falls back to ranged fire.
                (this.crushApproachStallTicks = 0),
                (this.lastCrushApproachDistance = void 0),
                (this.rangeCheckCooldown = 0),
                (this.lastInRangeTargetPosition = new M.Vector3()),
                (this.lastInRangeSelfPosition = new M.Vector3()),
                (this.initialIndirectTarget = !1),
                (this.forceDropTarget = !1),
                (this.rangeHelper = new s.RangeHelper(e.map.tileOccupation)),
                (this.losHelper = new a.LosHelper(e.map.tiles, e.map.tileOccupation)),
                (this.targetLinesConfig = { pathNodes: [] }),
                this.updateTargetLines(this.target, !0));
            }
            duplicate() {
              return new o(this.game, this.target, this.weapon, this.options);
            }
            getWeapon() {
              return this.weapon;
            }
            setWeapon(e) {
              this.weapon = e;
            }
            setForceAttack(e) {
              this.options.force = e;
            }
            requestTargetUpdate(e) {
              this.target.equals(e) || (this.needsTargetUpdate = e);
            }
            onTargetChange(e) {
              let t = e.attackTrait,
                i = this.target;
              ((t.currentTarget = i),
                (this.lastValidTargetPosition = i.obj ? { tile: i.tile, onBridge: i.getBridge() } : void 0),
                (this.initialTargetOwner = i.obj?.isTechno() ? i.obj.owner : void 0),
                (this.initialIndirectTarget =
                  !i.obj &&
                  this.game.map.tileOccupation
                    .getObjectsOnTile(i.tile)
                    .some((e) => (e.isOverlay() && !e.isBridgePlaceholder()) || e.isTerrain())),
                this.updateTargetLines(i, !0));
            }
            updateTargetLines(e, t) {
              ((this.targetLinesConfig.target = e.obj),
                (this.targetLinesConfig.pathNodes = e.obj ? [] : [{ tile: e.tile, onBridge: e.getBridge() }]),
                (this.targetLinesConfig.isAttack = t));
            }
            onStart(t) {
              if (!t.attackTrait) throw new Error(`Object ${t.name} has no attack trait`);
              if (0 !== t.ammo) {
                let e = this.game.map.tileOccupation;
                var i, r;
                ((t.attackTrait.attackState = T.AttackState.CheckRange),
                  this.onTargetChange(t),
                  (this.initialSelfPosition = {
                    tile: t.tile,
                    onBridge: t.isUnit() && t.onBridge ? e.getBridgeOnTile(t.tile) : void 0,
                  }),
                  this.weapon.rules.limboLaunch &&
                    t.isUnit() &&
                    !this.target.obj &&
                    ((this.forceDropTarget = !0),
                    ({ reachable: i, fallback: r } = this.findReachableMeleePosition(
                      this.target.tile,
                      !!this.target.getBridge(),
                      { width: 1, height: 1 },
                      t,
                    )),
                    !i &&
                      r &&
                      ((this.lastValidTargetPosition = r),
                      this.updateTargetLines(this.game.createTarget(r.onBridge, r.tile), !1))),
                  this.weapon.rules.limboLaunch &&
                    this.target.obj?.isTechno() &&
                    t.isUnit() &&
                    !this.rangeHelper.isInWeaponRange(t, this.target.obj, this.weapon, this.game.rules) &&
                    (({ reachable: i, fallback: r } = this.findReachableMeleePosition(
                      this.target.obj.tile,
                      this.target.obj.isUnit() && this.target.obj.onBridge,
                      this.target.obj.getFoundation(),
                      t,
                    )),
                    i ||
                      (1 < (t.unitOrderTrait.waypointPath?.waypoints?.length ?? 0)
                        ? this.cancel()
                        : ((this.forceDropTarget = !0),
                          r &&
                            ((this.lastValidTargetPosition = r),
                            this.updateTargetLines(this.game.createTarget(r.onBridge, r.tile), !1))))),
                  this.rangeHelper.isInWeaponRange(
                    t,
                    this.target.obj ?? this.target.tile,
                    this.weapon,
                    this.game.rules,
                  ) &&
                    t.isUnit() &&
                    t.rules.movementZone === O.MovementZone.Fly &&
                    t.zone !== x.ZoneType.Air &&
                    (t.rules.hoverAttack || (t.isAircraft() && !t.rules.fighter)) &&
                    this.children.push(new A.MoveTask(this.game, t.tile, !1).setCancellable(!1)));
              } else this.cancel();
            }
            findReachableMeleePosition(r, e, t, s) {
              let i = this.game.map,
                a = i.tileOccupation,
                n = e ? a.getBridgeOnTile(r) : void 0,
                o = new C.MovePositionHelper(i),
                l = s.rules.movementZone === O.MovementZone.Fly,
                c = (e, t) =>
                  l ||
                  (0 < i.terrain.getPassableSpeed(e, s.rules.speedType, s.isInfantry(), !!t) &&
                    o.isEligibleTile(e, t, n, r) &&
                    !i.terrain.findObstacles({ tile: e, onBridge: t }, s).length),
                h,
                u = new E.RadialTileFinder(i.tiles, i.mapBounds, r, t, 1, Math.ceil(this.weapon.rules.range), (e) => {
                  let t = !1;
                  var i;
                  return (
                    c(e, void 0) && ((h = h ?? { tile: e, onBridge: void 0 }), (t = !0)),
                    void 0 !== e.onBridgeLandType &&
                      ((i = a.getBridgeOnTile(e)), c(e, i) && ((h = h ?? { tile: e, onBridge: i }), (t = !0))),
                    !!t && this.rangeHelper.isInWeaponRange(s, r, this.weapon, this.game.rules, e)
                  );
                });
              return { reachable: u.getNextTile(), fallback: h };
            }
            onEnd(e) {
              // OpenYRWeb: clear the force-attack crush state so the crusher no longer
              // runs over friendly targets after the force-attack ends.
              ((e.isForceAttacking = !1),
              (e.currentAttackTarget = void 0),
              e.isVehicle() && e.turretTrait && (e.turretTrait.desiredFacing = e.direction),
                (e.attackTrait.attackState = T.AttackState.Idle),
                (e.attackTrait.currentTarget = void 0));
              var t = this.game.rules.general.prism.type;
              (e.isBuilding() &&
                e.name === t &&
                this.weapon.type !== g.WeaponType.Secondary &&
                this.countSupportBeamsAndFireDownTowers(e, t),
                this.weapon.rules.limboLaunch && e.attackTrait.expirePassiveScanCooldown(),
                (e.isInfantry() || e.isVehicle()) && (e.isFiring = !1),
                this.weapon.hasBurstsLeft() && this.weapon.resetBursts());
              // OpenYRWeb: stop any looping weapon-fire sound when the attack ends. A looping
              // Report sound (e.g. Gattling weapons whose [SoundList] has Control=Loop) keeps
              // playing after the unit stops firing otherwise — the only prior stop site was the
              // GattlingTrait stage-reset (gated behind a 200-tick spin-down). Stopping it here
              // matches vanilla YR (sound ends with the attack) and fixes the residual-loop bug.
              // For gattling units, multiple Report instances can be active simultaneously, so
              // stop every tracked handle rather than only the latest one.
              // OpenYRWeb fix: this stop must ONLY apply to gattling units. __weaponFireSound is
              // set for every weapon with a Report (see SoundHandler WeaponFire), so stopping it
              // for all units truncated single-shot fire sounds (e.g. GIAttack) the moment the
              // victim died and the task ended — it sounded like the death sound cut the fire
              // sound off. Non-loop sounds finish on their own.
              try {
                if (e.gattlingTrait) {
                  if (e.__weaponFireSounds && e.__weaponFireSounds.length) {
                    for (var gattlingSoundIdx = 0; gattlingSoundIdx < e.__weaponFireSounds.length; gattlingSoundIdx++)
                      e.__weaponFireSounds[gattlingSoundIdx].isPlaying() && e.__weaponFireSounds[gattlingSoundIdx].stop();
                    e.__weaponFireSounds.length = 0;
                  }
                  e.__weaponFireSound && e.__weaponFireSound.isPlaying() && (e.__weaponFireSound.stop(), (e.__weaponFireSound = void 0));
                }
              } catch (err) {}
            }
            forceCancel(t) {
              if (t.rules.movementZone !== O.MovementZone.Fly) return !1;
              if (!this.cancellable || this.children.some((e) => !e.cancellable)) return !1;
              if (this.status === r.TaskStatus.Running || this.status === r.TaskStatus.Cancelling) {
                if (this.children.filter((e) => e instanceof A.MoveTask).some((e) => !e.forceCancel(t))) return !1;
                (this.onEnd(t), (t.isInfantry() || t.isVehicle()) && (t.isFiring = !1));
              }
              return ((this.status = r.TaskStatus.Cancelled), !0);
            }
            onTick(r) {
              let s = r.attackTrait;
              (r.isInfantry() || r.isVehicle()) && s.attackState !== T.AttackState.Firing && (r.isFiring = !1);
              let t = this.target.obj,
                a = this.children.find((e) => e instanceof p.MoveInWeaponRangeTask),
                magDragging = r.magnetronDragging === t;

              if (this.isCancelling() && s.attackState !== T.AttackState.FireUp)
                return !r.airSpawnTrait?.isLaunchingMissiles() && (a?.cancel(), !0);
              let n = !1;
              if (s.attackState === T.AttackState.FireUp) {
                if (s.isDisabled()) return !0;
                ((s.attackState = T.AttackState.Firing), (n = !0));
              }
              if (s.attackState === T.AttackState.Firing) {
                if (
                  this.initialIndirectTarget &&
                  !this.game.map
                    .getObjectsOnTile(this.target.tile)
                    .find((e) => (e.isOverlay() && !e.isBridgePlaceholder()) || e.isTerrain())
                )
                  return (this.cancel(), this.onTick(r));
                if (n) {
                  var o = this.target.obj || this.target.tile;
                  // OpenYRWeb: DrainWeapon — the disc must be parked directly over the
                  // building's center tile before firing. If not, go back to CheckRange
                  // to re-position (MoveInWeaponRangeTask.onStart targets centerTile for
                  // drainWeapon + balloonHover units). This matches vanilla YR behavior.
                  if (
                    this.weapon.rules.drainWeapon &&
                    this.target.obj?.isBuilding() &&
                    !(r.tile.rx === this.target.obj.centerTile.rx && r.tile.ry === this.target.obj.centerTile.ry)
                  )
                    return ((s.attackState = T.AttackState.CheckRange), this.onTick(r));
                  if (
                    !this.game.isValidTarget(this.target.obj) ||
                    this.shouldDropTarget(this.target.obj) ||
                    (!magDragging &&
                      // OpenYRWeb: berserk units bypass weapon targeting (canTarget) so they
                      // can attack all units including friendlies.
                      !r.berserkTrait?.isBerserk() &&
                      !this.weapon.targeting.canTarget(
                        this.target.obj,
                        this.target.tile,
                        this.game,
                        !!this.options.force,
                        !!this.options.passive,
                      )) ||
                    (!magDragging && !this.rangeHelper.isInWeaponRange(r, o, this.weapon, this.game.rules)) ||
                    !this.losHelper.hasLineOfSight(r, o, this.weapon)
                  )
                    return ((s.attackState = T.AttackState.CheckRange), this.onTick(r));
                }
                if (this.weapon.rules.limboLaunch) {
                  if ((t?.isVehicle() || t?.isAircraft()) && t.parasiteableTrait?.isInfested()) return !0;
                  if (r.rules.movementZone !== O.MovementZone.Fly && t?.isUnit() && t.zone === x.ZoneType.Air)
                    return !0;
                }
                if (
                  this.target.tile.onBridgeLandType &&
                  r.tile.onBridgeLandType &&
                  r.isUnit() &&
                  (this.game.map.tileOccupation.getBridgeOnTile(this.target.tile)?.isHighBridge() ||
                    this.game.map.tileOccupation.getBridgeOnTile(r.tile)?.isHighBridge())
                )
                  if (
                    (t ? t.isUnit() && (t.zone === x.ZoneType.Air || t.onBridge) : this.target.isBridge()) !==
                    (r.zone === x.ZoneType.Air || r.onBridge)
                  )
                    return !0;
                let e = 1;
                o = this.game.rules.general.prism.type;
                if (
                  (r.isBuilding() &&
                    r.name === o &&
                    this.weapon.type !== g.WeaponType.Secondary &&
                    ((o = this.countSupportBeamsAndFireDownTowers(r, o)),
                    (e = 1 + o * this.game.rules.general.prism.supportModifier)),
                  this.weapon.rules.spawner && (r.isVehicle() || r.isAircraft()) && r.parasiteableTrait?.isParalyzed())
                )
                  return !0;
                if (0 === r.ammo) {
                  // OpenYRWeb: fighter fired its last weapon while still on its strafing
                  // run — do NOT cancel the move task here (that stops the aircraft dead
                  // in the air: it hovers, then turns around). Instead finish the pass:
                  // completeRun redirects the run to fly past the target; the TaskRunner
                  // keeps this attack task alive until the move task completes on its own.
                  // Non-fighter aircraft keep the vanilla deferred cancel (bombers fly
                  // their maneuver tile before cancelling).
                  if (r.rules.fighter && a) {
                    a.completeRun(r, this.target.obj ?? this.target.tile, this.options.airstrikeExitTile);
                    return !0;
                  }
                  return (a?.cancel(), !0);
                }
                let i = !1;
                if (this.weapon.rules.limboLaunch) {
                  let t = a;
                  if (!t) {
                    let e = r.unitOrderTrait.getCurrentTask();
                    if (e && e !== this && s.getOpportunityFireTask() === this) {
                      if (!(e instanceof A.MoveTask)) return (e.cancel(), !1);
                      t = e;
                    }
                  }
                  if (t) {
                    if (!t.forceCancel(r)) return !1;
                    ((r.moveTrait.lastTargetOffset = void 0), (r.moveTrait.lastVelocity = void 0));
                  }
                  i = !0;
                }
                // OpenYRWeb: Garrisoned buildings — each soldier fires independently
                // with their own weapon and own ROF, not divided by occupant count.
                if (r.isBuilding() && r.garrisonTrait && r.garrisonTrait.isOccupied()) {
                  for (var occ of r.garrisonTrait.units) {
                    // OpenYRWeb: each occupant fires its OccupyWeapon (vanilla YR: GI
                    // fires its UCPara weapon while occupying; defaults to Primary).
                    var wp = occ.armedTrait?.getGarrisonWeapon();
                    if (wp && 0 === wp.getCooldownTicks() &&
                        wp.targeting.canTarget(this.target.obj, this.target.tile, this.game, !!this.options.force, !!this.options.passive)) {
                      wp.fire(this.target, this.game, 1);
                    }
                  }
                  s.attackState = T.AttackState.JustFired;
                  return !1;
                }
                // OpenYRWeb: OpenTopped transports (e.g. Battle Fortress) — each passenger
                // fires their own weapon independently. Unlike garrisoned buildings, the
                // vehicle's own weapon ALSO fires (we do NOT return false here — execution
                // continues to the normal weapon-fire path below). Passengers can fire while
                // the vehicle moves (fire on the move). The OpenToppedDamageMultiplier and
                // OpenToppedRangeBonus are applied internally in Weapon.fire / Weapon.get range
                // via the passenger's transport back-reference (set in EnterTransportTask).
                if (r.transportTrait && r.rules.openTopped && r.transportTrait.units.length) {
                  var openToppedTarget = this.target.obj || this.target.tile;
                  for (var passenger of r.transportTrait.units) {
                    // OpenYRWeb: use OpenTransportWeapon (GGI fires its MissileLauncher
                    // from the BF, not the M60 MG).
                    var passengerWeapon = passenger.armedTrait?.getOpenToppedWeapon();
                    if (
                      passengerWeapon &&
                      0 === passengerWeapon.getCooldownTicks() &&
                      passengerWeapon.targeting.canTarget(
                        this.target.obj,
                        this.target.tile,
                        this.game,
                        !!this.options.force,
                        !!this.options.passive,
                      ) &&
                      // Each passenger checks its own range and LOS independently —
                      // passenger 1 (range 8+2) may hit when passenger 2 (range 3+2) cannot.
                      this.rangeHelper.isInWeaponRange(r, openToppedTarget, passengerWeapon, this.game.rules) &&
                      this.losHelper.hasLineOfSight(r, openToppedTarget, passengerWeapon)
                    ) {
                      passengerWeapon.fire(this.target, this.game, 1);
                    }
                  }
                  // If selectWeaponVersus picked a passenger's weapon as this.weapon, it was
                  // already fired above — skip the normal fire path to avoid double-firing.
                  // (This happens when the vehicle's own weapon can't target, e.g. BFRT MG
                  // vs aircraft — a Guardian GI's AA missile is selected instead.)
                  if (r.transportTrait.units.some((p) => p.armedTrait?.getOpenToppedWeapon() === this.weapon)) {
                    s.attackState = T.AttackState.JustFired;
                    return !1;
                  }
                }
                // OpenYRWeb: FireWhileMoving=no — the unit must be fully stationary to fire
                // this weapon (vanilla: DiskDrain on the Floating Disc, ROF=50 drain ticks).
                // If the unit is still moving, keep waiting in Firing state without consuming
                // the shot. Mirrors yrmd.exe's FireWhileMoving gate on the firing check.
                if (!this.weapon.rules.fireWhileMoving && r.moveTrait && r.moveTrait.isMoving()) return !1;
                // OpenYRWeb: powered buildings (base defenses) cannot fire while unpowered
                // (drained by Floating Disc or Low Power blackout).
                if (r.isBuilding() && r.poweredTrait && !r.poweredTrait.isPoweredOn()) return !1;
                // OpenYRWeb: AreaFire=yes weapons fire at the shooter's own tile so the gas
                // effect spreads from the unit's position (e.g. Chaos Drone), matching the
                // deployed area-fire behavior.
                var areaFireTarget = this.weapon.rules.areaFire ? this.game.createTarget(void 0, r.position.tile) : this.target;
                return (this.weapon.fire(areaFireTarget, this.game, e), i)
                  ? !0
                  : (!!this.weapon.rules.fireOnce && !this.weapon.rules.drainWeapon) ||
                      !(!this.options.passive || !r.rules.distributedFire) ||
                      ((s.attackState = T.AttackState.JustFired), !1);
              }
              if (s.attackState === T.AttackState.JustFired)
                return ((s.attackState = T.AttackState.PrepareToFire), this.onTick(r));
              (this.needsTargetUpdate &&
                ((this.target = this.needsTargetUpdate),
                (t = this.target.obj),
                (this.needsTargetUpdate = void 0),
                this.onTargetChange(r),
                t || a?.retarget(this.target.tile, !!this.target.getBridge())),
                t?.isTechno() &&
                  t.replacedBy &&
                  ((l = this.game.createTarget(t.replacedBy, t.replacedBy.tile)),
                  (this.target = l),
                  (t = t.replacedBy),
                  this.onTargetChange(r)));
              // OpenYRWeb: the target was destroyed mid-approach — stop chasing its
              // old position (previously the plane flew all the way to the destroyed
              // building and only turned around after reaching it). Abort the attack
              // so the unit moves on (airstrike planes then head straight for their
              // random exit).
              if (t && t.isDestroyed) return (this.cancel(), this.onTick(r));
              let i = this.game.isValidTarget(t) && !this.shouldDropTarget(t);
              if (i && !magDragging) {
                // OpenYRWeb: berserk units bypass weapon targeting (canTarget) so they
                // can attack all units including friendlies.
                let e = r.berserkTrait?.isBerserk() ||
                  this.weapon.targeting.canTarget(
                  t,
                  this.target.tile,
                  this.game,
                  !!this.options.force,
                  !!this.options.passive,
                );
                if (!e || !r.armedTrait.isEquippedWithWeapon(this.weapon)) {
                  var l = s.selectWeaponVersus(r, this.target, this.game, this.options.force, this.options.passive);
                  if (l) {
                    if ((this.setWeapon(l), s.attackState !== T.AttackState.CheckRange))
                      return ((s.attackState = T.AttackState.CheckRange), this.onTick(r));
                    e = !0;
                  } else e = !1;
                }
                i = e;
              }
              if (
                (i &&
                  ((c = this.lastTargetTpCheck),
                  t?.isUnit() && c && t.moveTrait.lastTeleportTick >= c
                    ? ((i = !1), (this.rangeCheckCooldown = 0))
                    : (this.lastTargetTpCheck = this.game.currentTick)),
                i && t && (this.lastValidTargetPosition = { tile: t.tile, onBridge: this.target.getBridge() }),
                i || (this.targetLinesConfig.isAttack = !1),
                s.attackState === T.AttackState.CheckRange)
              ) {
                let e = this.target.obj ? (i ? this.target.obj : this.lastValidTargetPosition.tile) : this.target.tile;
                // OpenYRWeb: OpenTopped transports — passengers fire independently every
                // tick while the task is in CheckRange (idle, approaching, or moving).
                // This runs BEFORE the rangeCheckCooldown early-return: that cooldown is
                // re-armed on every CheckRange while the vehicle is still outside its own
                // weapon's range (closing in on the target), so gating passenger fire on
                // it would mean passengers never shoot while the vehicle is moving.
                if (i && !magDragging && r.transportTrait && r.rules.openTopped && r.transportTrait.units.length) {
                  for (var approachPassenger of r.transportTrait.units) {
                    // OpenYRWeb: use OpenTransportWeapon (GGI fires its MissileLauncher
                    // from the BF, not the M60 MG).
                    var approachPassengerWeapon = approachPassenger.armedTrait?.getOpenToppedWeapon();
                    if (
                      approachPassengerWeapon &&
                      0 === approachPassengerWeapon.getCooldownTicks() &&
                      approachPassengerWeapon.targeting.canTarget(
                        this.target.obj,
                        this.target.tile,
                        this.game,
                        !!this.options.force,
                        !!this.options.passive,
                      ) &&
                      this.rangeHelper.isInWeaponRange(r, e, approachPassengerWeapon, this.game.rules) &&
                      this.losHelper.hasLineOfSight(r, e, approachPassengerWeapon)
                    ) {
                      approachPassengerWeapon.fire(this.target, this.game, 1);
                    }
                  }
                }
                if (0 < this.rangeCheckCooldown) return (this.rangeCheckCooldown--, !1);
                var c = this.target.obj
                  ? i
                    ? this.target.obj.isBuilding()
                      ? this.target.obj.centerTile
                      : this.target.obj.tile
                    : this.lastValidTargetPosition.tile
                  : this.target.tile;
                // OpenYRWeb: Magnetron dragging a vehicle skips minimum-range check
                // (vanilla YR: the Magnetron does not back away from min range while
                // dragging; the victim is being pulled in, not kept at distance) but still
                // enforces maximum range so that if the target is teleported away, the
                // attack task will chase (and the drag will naturally follow) or end.
                // OpenYRWeb: vanilla YR "attack-to-crush" (yrmd sub_7414E0): a Crusher
                // drives onto a crushable ground target instead of stopping at weapon
                // range to fire (Battle Fortress walks over infantry/tanks/walls). Zone
                // Air is excluded — aircraft can never be driven over. Walls (overlay)
                // qualify too: force-attacking a (friendly) wall drives over and crushes
                // it. OmniCrushers (BFRT) crush at any distance; plain Crushers (Grizzly
                // etc.) only crush an adjacent target, otherwise they keep firing.
                // Record the force-attack state so the crush logic can run over friendly
                // targets that are being force-attacked.
                (r.isForceAttacking = !!this.options.force),
                (r.currentAttackTarget = this.options.force ? this.target.obj : void 0);
                var crushTarget = !!(
                  t &&
                  (!t.isBuilding() || t.rules.wall) &&
                  (!t.isUnit() || t.zone !== x.ZoneType.Air) &&
                  r.isUnit() &&
                  r.canCrushObject(t) &&
                  !this.crushApproachFailed &&
                  (r.omniCrusher || this.rangeHelper.tileDistance(r, t) <= 1)
                );
                var inRange;
                if (magDragging) {
                  inRange = this.rangeHelper.isInRange(r, e, 0, this.weapon.range, !1);
                } else {
                  inRange = this.rangeHelper.isInWeaponRange(r, e, this.weapon, this.game.rules);
                }
                // OpenYRWeb: DrainWeapon on a building — the disc must be parked
                // exactly over the centerTile to fire (enforced in Firing state).
                // Even if the weapon's Range covers the current tile, force the disc
                // to reposition so the Firing check doesn't send us back to CheckRange,
                // creating an infinite loop.
                if (inRange && this.weapon.rules.drainWeapon && this.target.obj?.isBuilding()) {
                  var ct = this.target.obj.centerTile;
                  var wasInRange = inRange;
                  inRange = r.tile.rx === ct.rx && r.tile.ry === ct.ry;
                }
                if (
                  // OpenYRWeb: crush-on-attack — always keep closing in (create the move
                  // task once), but once in weapon range with LOS the unit FIRES while the
                  // move task keeps driving it onto the target (vanilla YR attacks and
                  // crushes simultaneously). The `!a` guard ensures the first approach move
                  // task is still created even when already in range.
                  crushTarget
                    ? !inRange || !this.losHelper.hasLineOfSight(r, e, this.weapon) || !a
                    : (!inRange ||
                        !this.losHelper.hasLineOfSight(r, e, this.weapon) ||
                        (r.isUnit() &&
                          r.rules.balloonHover &&
                          !r.rules.hoverAttack &&
                          // OpenYRWeb: BalloonHover units (e.g. Floating Disc) use actual Range;
                          // exempt from same-tile rule so they stop at weapon range and fire.
                          !(this.weapon.rules.isDiskLaser || this.weapon.rules.drainWeapon || this.weapon.range > 0) &&
                          !a &&
                          r.tile !== c &&
                          !this.options.holdGround) ||
                        (r.isAircraft() && !a && (this.weapon.projectileRules.iniRot <= 1 || r.rules.fighter)))
                ) {
                  if (r.isUnit() && !this.options.holdGround && this.game.map.isWithinBounds(c)) {
                    if (a) {
                      if (a.target !== this.target.obj || i)
                        if (
                          i &&
                          this.target.obj &&
                          // OpenYRWeb: crush-on-attack retargets as soon as the crushable
                          // target MOVES, so the crusher chases its current tile instead of
                          // driving to the stale coordinate first, then turning, then
                          // pursuing. Non-crush attacks keep the original range-based chase.
                          (crushTarget
                            ? this.target.obj.tile !== this.lastSelfMoveTargetTile
                            : this.rangeHelper.tileDistance(this.target.obj, this.lastSelfMoveTargetTile) >
                              this.weapon.range)
                        ) {
                          (a.retarget(this.target.obj, !!this.target.getBridge()),
                            (this.lastSelfTileBeforeMove = r.tile),
                            (this.lastSelfMoveTargetTile = this.target.obj?.tile ?? this.target.tile));
                          // OpenYRWeb: crush-on-attack — the existing move task was just
                          // retargeted onto the crushable victim; wait for it instead of
                          // spawning a duplicate move task this tick.
                          if (crushTarget) return !1;
                        } else {
                          if (
                            void 0 !== this.options.leashTiles &&
                            this.rangeHelper.tileDistance(this.initialSelfPosition.tile, r.tile) >
                              this.options.leashTiles
                          )
                            return (a.cancel(), !0);
                          var h = e instanceof v.GameObject && e.isUnit() ? e.moveTrait.baseSpeed : 0,
                            u = Math.ceil(
                              (this.rangeHelper.tileDistance(r, e) - (this.weapon.range + 1)) /
                                ((r.moveTrait.baseSpeed + h) / w.Coords.LEPTONS_PER_TILE),
                            );
                          0 < u && (this.rangeCheckCooldown = Math.min(S.GameSpeed.BASE_TICKS_PER_SECOND, u));
                          // OpenYRWeb: crush-on-attack already has a move task homing onto
                          // the crushable target — wait for it instead of spawning a
                          // duplicate MoveInWeaponRangeTask every tick. Without this the
                          // BFRT (in weapon range, so the cooldown above stays 0) would
                          // rebuild the move task on every CheckRange and never reach
                          // PrepareToFire (it stands still, neither moving nor firing).
                          // OpenYRWeb: crush-approach progress guard — if the crush move
                          // task never closes the gap on the crushable target (unit parked
                          // adjacent to a wall it cannot drive onto), give up on the crush
                          // and let the normal moveAttempts fallback switch to ranged fire.
                          var _d = this.rangeHelper.tileDistance(r, e);
                          if (void 0 === this.lastCrushApproachDistance || _d < this.lastCrushApproachDistance) {
                            (this.lastCrushApproachDistance = _d), (this.crushApproachStallTicks = 0);
                          } else if (40 < ++this.crushApproachStallTicks) {
                            (a.cancel(),
                              (this.lastCrushApproachDistance = void 0),
                              (this.crushApproachStallTicks = 0),
                              (this.moveAttempts = P + 1));
                          }
                          if (crushTarget) return !1;
                        }
                      else {
                        let e;
                        ((e =
                          void 0 !== this.options.leashTiles
                            ? this.game.createTarget(this.initialSelfPosition.onBridge, this.initialSelfPosition.tile)
                            : this.game.createTarget(
                                this.lastValidTargetPosition.onBridge,
                                this.lastValidTargetPosition.tile,
                              )),
                          (s.currentTarget = e),
                          a.retarget(e.tile, e.isBridge()),
                          this.updateTargetLines(e, !1));
                      }
                      return !1;
                    }
                    if (!r.moveTrait || r.moveTrait.isDisabled()) return !0;
                    if (this.isCancelling()) return !0;
                    if (
                      (r.tile === this.lastSelfTileBeforeMove ||
                      (this.moveExecuted && r.moveTrait.lastMoveResult === b.MoveResult.Fail)
                        ? this.moveAttempts++
                        : (this.moveAttempts = 0),
                      this.weapon.rules.limboLaunch &&
                        r.defaultToGuardArea &&
                        t &&
                        this.moveExecuted &&
                        r.moveTrait.lastMoveResult === b.MoveResult.Fail &&
                        this.rangeHelper.isInRange(r, t, 0, r.armedTrait.computeGuardScanRange(this.weapon), !0))
                    )
                      return !0;
                    if (this.moveAttempts > P) {
                      // OpenYRWeb: crush-on-attack could not reach the target — fall back to
                      // normal ranged fire on subsequent checks. Do NOT abort the attack
                      // (previously `return !0` ended the task, so a crusher parked next to
                      // a wall it could not drive onto neither fired nor crushed). Reset
                      // moveAttempts so the check does not re-trigger and block the normal
                      // move-to-range fallback on the next tick.
                      (this.crushApproachFailed = !0), (this.moveAttempts = 0);
                      return !1;
                    }
                    0 < this.moveAttempts && this.children.push(new d.WaitMinutesTask(1 / 60));
                    ((h = e), (u = t && !i ? this.lastValidTargetPosition.onBridge : this.target.getBridge()));
                    return (
                      (a = new p.MoveInWeaponRangeTask(this.game, h, !!u, this.weapon, crushTarget)),
                      (a.blocking = !1),
                      this.children.push(a),
                      (this.moveExecuted = !0),
                      (this.lastSelfTileBeforeMove = r.tile),
                      (this.lastSelfMoveTargetTile = h instanceof v.GameObject ? h.tile : h),
                      this.onTick(r)
                    );
                  }
                  // OpenYRWeb: OpenTopped transport on holdGround — the vehicle's own
                  // weapon is out of range and holdGround prevents approaching, but
                  // passengers may still be in range. Don't complete the task (which
                  // would end passive fire after one shot); stay in CheckRange so
                  // passengers keep firing every tick. If no passenger can hit, the
                  // task completes as normal.
                  if (r.transportTrait && r.rules.openTopped && r.transportTrait.units.length) {
                    for (var holdPassenger of r.transportTrait.units) {
                      var holdPassengerWeapon = holdPassenger.armedTrait?.getOpenToppedWeapon();
                      if (
                        holdPassengerWeapon &&
                        this.rangeHelper.isInWeaponRange(r, e, holdPassengerWeapon, this.game.rules) &&
                        this.losHelper.hasLineOfSight(r, e, holdPassengerWeapon)
                      )
                        return !1;
                    }
                  }
                  return !0;
                }
                if (
                  ((this.moveExecuted = !1),
                  (this.moveAttempts = 0),
                  a &&
                    ((r.rules.balloonHover && !r.rules.hoverAttack) ||
                      r.rules.fighter ||
                      r.rules.spawned ||
                      (r.rules.movementZone === O.MovementZone.Fly &&
                        !this.rangeHelper.isInRange2(
                          r,
                          this.target.obj ?? this.target.tile,
                          this.weapon.minRange,
                          this.weapon.range - 1,
                        )) ||
                      // OpenYRWeb: crush-on-attack keeps the move task alive so the weapon
                      // fires while the crusher keeps closing in to crush (vanilla YR does
                      // both simultaneously).
                      (!crushTarget && a.cancel())),
                  a && (r.isInfantry() || this.weapon.rules.spawner))
                )
                  return !1;
                if (a?.children.some((e) => !e.cancellable) && this.weapon.rules.limboLaunch) return !1;
                if (
                  a &&
                  a.shouldAirStrafe(r) &&
                  this.target.obj?.isUnit() &&
                  this.target.obj.moveTrait.isMoving() &&
                  1 < this.weapon.range &&
                  !this.rangeHelper.isInRange2(r, this.target.obj, this.weapon.minRange, this.weapon.range - 1)
                )
                  return !1;
                s.attackState = T.AttackState.PrepareToFire;
              }
              if (s.attackState !== T.AttackState.PrepareToFire) return !1;
              if (!i || s.isDisabled()) return (a?.cancel(), !0);
              ((u = this.target.getWorldCoords()), (h = r.position.worldPosition));
              if (
                // OpenYRWeb: crush-on-attack fires ON THE MOVE (the move task is closing
                // in to crush), so the "must be stationary" re-check is skipped — vanilla
                // YR fires and crushes simultaneously.
                !crushTarget &&
                !(
                  this.lastInRangeTargetPosition.length() &&
                  this.lastInRangeTargetPosition.equals(u) &&
                  this.lastInRangeSelfPosition.length() &&
                  this.lastInRangeSelfPosition.equals(h)
                )
              )
                return (
                  this.lastInRangeTargetPosition.copy(u),
                  this.lastInRangeSelfPosition.copy(h),
                  (s.attackState = T.AttackState.CheckRange),
                  this.onTick(r)
                );
              if (!(this.weapon.rules.omniFire || (r.rules.omniFire && r.rules.fighter))) {
                var h = new M.Vector3().copy(u).sub(h),
                  e = m.FacingUtil.fromMapCoords(new R.Vector2(h.x, h.z)),
                  h = this.weapon.projectileRules.rot ? k : I;
                if ((r.isVehicle() || r.isBuilding()) && r.turretTrait && !r.rules.turretSpins) {
                  if (((r.turretTrait.desiredFacing = e), Math.abs(e - r.turretTrait.facing) >= h)) return !1;
                } else if (Math.abs(e - r.direction) >= h) {
                  if (r.isAircraft())
                    return ((r.direction = m.FacingUtil.tick(r.direction, e, r.rules.rot).facing), !1);
                  if (a) return !1;
                  if (this.options.disallowTurning) return !0;
                  if (r.isVehicle()) return (this.children.push(new f.TurnTask(e)), !1);
                  r.direction = e;
                }
              }
              if (!this.losHelper.hasLineOfSight(r, this.target.obj || this.target.tile, this.weapon))
                return ((s.attackState = T.AttackState.CheckRange), this.onTick(r));
              if (s.isOnCooldown(r)) return !1;
              if (this.weapon.warhead.rules.temporal && r.temporalTrait.getTarget() === this.target.obj) return !1;
              if (this.weapon.rules.suicide && this.weapon.type !== g.WeaponType.DeathWeapon)
                return (this.game.destroyObject(r, { player: r.owner, obj: r, weapon: this.weapon }), !0);
              e = this.game.rules.general.prism.type;
              return (
                r.isBuilding() &&
                  r.name === e &&
                  this.weapon.type !== g.WeaponType.Secondary &&
                  this.fireUpPrismSupportTowers(r, e),
                (r.isInfantry() || r.isVehicle()) && (r.isFiring = !0),
                r.art.fireUp
                  ? ((r.isInfantry() && r.suppressionTrait?.isSuppressed()) ||
                      this.children.push(new y.WaitTicksTask(r.art.fireUp).setCancellable(!1)),
                    (s.attackState = T.AttackState.FireUp),
                    !1)
                  : ((s.attackState = T.AttackState.Firing), this.onTick(r))
              );
            }
            shouldDropTarget(e) {
              return (
                this.forceDropTarget ||
                (e?.isTechno() &&
                  ((this.weapon.rules.limboLaunch &&
                    (((e.isVehicle() || e.isAircraft()) && e.parasiteableTrait?.isInfested()) ||
                      e.invulnerableTrait.isActive())) ||
                    (e.warpedOutTrait.isInvulnerable() && !this.weapon.warhead.rules.temporal) ||
                    this.initialTargetOwner !== e.owner))
              );
            }
            fireUpPrismSupportTowers(t, i) {
              var e;
              for (e of t.owner
                .getOwnedObjectsByType(n.ObjectType.Building)
                .filter(
                  (e) =>
                    e.name === i &&
                    e.secondaryWeapon &&
                    !e.unitOrderTrait.hasTasks() &&
                    e.attackTrait &&
                    !e.attackTrait.isDisabled() &&
                    !e.attackTrait.isOnCooldown(e),
                )
                .filter((e) => this.rangeHelper.isInWeaponRange(e, t, e.secondaryWeapon, this.game.rules))
                .slice(0, this.game.rules.general.prism.supportMax))
                e.unitOrderTrait.addTask(
                  e.attackTrait.createAttackTask(this.game, t, t.centerTile, e.secondaryWeapon, { passive: !0 }),
                );
            }
            countSupportBeamsAndFireDownTowers(t, i) {
              var e,
                r = t.owner
                  .getOwnedObjectsByType(n.ObjectType.Building)
                  .filter((e) => e.name === i && e.attackTrait?.currentTarget?.obj === t);
              for (e of r) e.unitOrderTrait.getCurrentTask()?.cancel();
              return Math.min(this.game.rules.general.prism.supportMax, r.length);
            }
            getTargetLinesConfig() {
              return this.targetLinesConfig;
            }
          }),
          e("AttackTask", o));
      },
    };
  },
);
