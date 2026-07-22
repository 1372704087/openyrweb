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
                    (t.rules.hoverAttack || t.isAircraft()) &&
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
              (e.isVehicle() && e.turretTrait && (e.turretTrait.desiredFacing = e.direction),
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
              try {
                if (e.gattlingTrait && e.__weaponFireSounds && e.__weaponFireSounds.length) {
                  for (var gattlingSoundIdx = 0; gattlingSoundIdx < e.__weaponFireSounds.length; gattlingSoundIdx++)
                    e.__weaponFireSounds[gattlingSoundIdx].isPlaying() && e.__weaponFireSounds[gattlingSoundIdx].stop();
                  e.__weaponFireSounds.length = 0;
                }
                e.__weaponFireSound && e.__weaponFireSound.isPlaying() && (e.__weaponFireSound.stop(), (e.__weaponFireSound = void 0));
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
                if (0 === r.ammo) return (r.isAircraft() && (r.rules.fighter || r.rules.spawned) && a?.cancel(), !0);
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
                    var wp = occ.primaryWeapon;
                    if (wp && 0 === wp.getCooldownTicks() &&
                        wp.targeting.canTarget(this.target.obj, this.target.tile, this.game, !!this.options.force, !!this.options.passive)) {
                      wp.fire(this.target, this.game, 1);
                    }
                  }
                  s.attackState = T.AttackState.JustFired;
                  return !1;
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
                if (0 < this.rangeCheckCooldown) return (this.rangeCheckCooldown--, !1);
                let e = this.target.obj ? (i ? this.target.obj : this.lastValidTargetPosition.tile) : this.target.tile;
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
                  !inRange ||
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
                  (r.isAircraft() && this.weapon.projectileRules.iniRot <= 1 && !a)
                ) {
                  if (r.isUnit() && !this.options.holdGround && this.game.map.isWithinBounds(c)) {
                    if (a) {
                      if (a.target !== this.target.obj || i)
                        if (
                          i &&
                          this.target.obj &&
                          this.rangeHelper.tileDistance(this.target.obj, this.lastSelfMoveTargetTile) >
                            this.weapon.range
                        )
                          (a.retarget(this.target.obj, !!this.target.getBridge()),
                            (this.lastSelfTileBeforeMove = r.tile),
                            (this.lastSelfMoveTargetTile = this.target.obj?.tile ?? this.target.tile));
                        else {
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
                    if (this.moveAttempts > P) return !0;
                    0 < this.moveAttempts && this.children.push(new d.WaitMinutesTask(1 / 60));
                    ((h = e), (u = t && !i ? this.lastValidTargetPosition.onBridge : this.target.getBridge()));
                    return (
                      (a = new p.MoveInWeaponRangeTask(this.game, h, !!u, this.weapon)),
                      (a.blocking = !1),
                      this.children.push(a),
                      (this.moveExecuted = !0),
                      (this.lastSelfTileBeforeMove = r.tile),
                      (this.lastSelfMoveTargetTile = h instanceof v.GameObject ? h.tile : h),
                      this.onTick(r)
                    );
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
                      a.cancel()),
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
              if (!(
                this.lastInRangeTargetPosition.length() &&
                this.lastInRangeTargetPosition.equals(u) &&
                this.lastInRangeSelfPosition.length() &&
                this.lastInRangeSelfPosition.equals(h)
              ))
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
