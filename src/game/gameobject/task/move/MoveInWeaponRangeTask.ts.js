// === Reconstructed SystemJS module: game/gameobject/task/move/MoveInWeaponRangeTask ===
// deps: ["game/gameobject/task/move/MoveTask","game/gameobject/GameObject","game/gameobject/unit/RangeHelper","game/Coords","game/gameobject/unit/LosHelper","game/map/tileFinder/RadialTileFinder","game/type/MovementZone","game/gameobject/unit/ZoneType","game/gameobject/trait/MoveTrait","game/map/tileFinder/RandomTileFinder","game/type/LocomotorType","util/bresenham","game/gameobject/unit/FacingUtil","game/math/Vector2"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/move/MoveInWeaponRangeTask",
  [
    "game/gameobject/task/move/MoveTask",
    "game/gameobject/GameObject",
    "game/gameobject/unit/RangeHelper",
    "game/Coords",
    "game/gameobject/unit/LosHelper",
    "game/map/tileFinder/RadialTileFinder",
    "game/type/MovementZone",
    "game/gameobject/unit/ZoneType",
    "game/gameobject/trait/MoveTrait",
    "game/map/tileFinder/RandomTileFinder",
    "game/type/LocomotorType",
    "util/bresenham",
    "game/gameobject/unit/FacingUtil",
    "game/math/Vector2",
  ],
  function (e, t) {
    "use strict";
    var i, n, s, o, a, l, c, h, r, u, d, g, p, m, f;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          u = e;
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
      ],
      execute: function () {
        (e("STRAFE_CLOSE_ENOUGH", 2),
          (f = class extends i.MoveTask {
            constructor(e, t, i, r, crushMode = !1) {
              (super(e, t instanceof n.GameObject ? (t.isBuilding() ? t.centerTile : t.tile) : t, i, {
                // OpenYRWeb: crush-on-attack drives onto the crushable target's OWN tile,
                // so the target must be ignored as a blocker by the move path-validation
                // too — it reads options.ignoredBlockers, NOT pathFinderIgnoredBlockers.
                // Without this, the wall's tile fails the passability check on the final
                // approach, the move re-plans forever and the crusher parks adjacent,
                // neither crushing nor firing. Normal attacks stop at weapon range, so
                // they never hit this, but crushMode must reach the target tile itself.
                ignoredBlockers: crushMode && t instanceof n.GameObject && 0 < r.range ? [t] : void 0,
                pathFinderIgnoredBlockers: t instanceof n.GameObject && 0 < r.range ? [t] : void 0,
              }),
                (this.target = t),
                (this.weapon = r),
                // OpenYRWeb: crush-on-attack — the crusher must drive ONTO the victim's
                // tile (adjacent/same tile) rather than stopping at weapon range, so the
                // MoveTrait crush kicks in.
                (this.crushMode = crushMode),
                (this.recalcMinRange = !0),
                (this.cancelRequested = !1),
                // OpenYRWeb: set when the plane has fired its last weapon — the
                // endless fighter strafing retarget is stopped so the current
                // pass can finish and the run completes on its own.
                (this.runCompleted = !1),
                (this.bomberInitialLock = !1),
                (this.rangeHelper = new s.RangeHelper(e.map.tileOccupation)),
                (this.losHelper = new a.LosHelper(e.map.tiles, e.map.tileOccupation)));
            }
            onStart(i) {
              let e = this.target,
                r = this.game.map;
              // OpenYRWeb: crush-on-attack (crushMode) must drive ONTO the crushable
              // building's own tile so the MoveTrait crush fires — never redirect the
              // destination to a tile near the building (that is what parked the crusher
              // adjacent to a wall, neither crushing nor firing).
              if (e instanceof n.GameObject && e.isBuilding() && i.rules.movementZone !== c.MovementZone.Fly && !this.crushMode) {
                let t = e.tile;
                var s = e instanceof n.GameObject ? e.getFoundation() : { width: 1, height: 1 },
                  s = new l.RadialTileFinder(
                    r.tiles,
                    r.mapBounds,
                    t,
                    s,
                    1,
                    5,
                    (e) =>
                      0 < r.terrain.getPassableSpeed(e, i.rules.speedType, i.isInfantry(), !1) &&
                      Math.abs(e.z - t.z) < 2,
                  ).getNextTile();
                s && this.rangeHelper.tileDistance(e, s) > Math.SQRT2 && this.updateTarget(s, !1);
              }
              ((this.bomberInitialLock = this.isCloseEnoughToDest(i, i.tile)),
              // OpenYRWeb: For balloonHover units (e.g. Floating Disc), redirect destination
              // to within weapon range so the disc stops at range, not on the target's head.
              (this.weapon.rules.isDiskLaser || this.weapon.rules.drainWeapon || this.weapon.range > 0) &&
                i.rules.balloonHover &&
                !i.rules.hoverAttack &&
                !this.isCloseEnoughToDest(i, i.tile) ||
                // NOTE: The && (C && D) below is short-circuited by the || chain above
                // when isCloseEnoughToDest returns true (disc already in weapon range).
                // DrainWeapon specifically requires the disc to be over the building's
                // centerTile (enforced in AttackTask's Firing state). The redirect is
                // moved into a standalone check below so it runs unconditionally.
                !1,
              // OpenYRWeb: DrainWeapon on a building — always redirect to centerTile.
              // The disc must hover exactly above the building's center for the drain
              // weapon to fire (enforced in AttackTask's Firing state). This runs
              // unconditionally (not in the || chain above) because the || short-circuits
              // when the disc is already within weapon range (adjacent tile), preventing
              // the centerTile redirect from ever being evaluated.
              (this.weapon.rules.drainWeapon &&
                e instanceof n.GameObject &&
                e.isBuilding() &&
                (i.tile.rx !== e.centerTile.rx || i.tile.ry !== e.centerTile.ry) &&
                (this.updateTarget(e.centerTile, e instanceof n.GameObject && !!e.onBridge),
                !0)) ||
                !1,
              super.onStart(i));
            }
            findRangeApproachTile(e, t) {
              let i = t.rx - e.rx,
                r = t.ry - e.ry,
                s = Math.sqrt(i * i + r * r);
              if (s <= this.weapon.range || s <= 0) return null;
              // Use (range - 1) as approach distance so the disc's tile is well within
              // weapon range.  The exact range boundary can fail due to integer rounding
              // (e.g. an approach tile at distance 7.07 when range=7 → isInWeaponRange
              // returns false and the disc keeps chasing the target).
              let approachRange = Math.max(1, this.weapon.range - 1),
                a = approachRange / s,
                n = Math.round(t.rx - i * a),
                h = Math.round(t.ry - r * a);
              var o = this.game.map.tiles[n] && this.game.map.tiles[n][h];
              return o && this.game.map.isWithinBounds(o) ? o : null;
            }
            cancel() {
              this.bomberManeuverTile ? (this.cancelRequested = !0) : super.cancel();
            }
            shouldAirStrafe(e) {
              return (
                e.rules.movementZone === c.MovementZone.Fly &&
                e.rules.locomotor === d.LocomotorType.Aircraft &&
                e.rules.fighter &&
                1 < this.weapon.projectileRules.iniRot
              );
            }
            isBombingRun(e) {
              return (
                e.rules.movementZone === c.MovementZone.Fly &&
                e.rules.locomotor === d.LocomotorType.Aircraft &&
                this.weapon.projectileRules.iniRot <= 1
              );
            }
            isAirStrafeCloseEnough(e) {
              return this.rangeHelper.tileDistance(e, this.targetTile) < Math.min(this.weapon.range, 2);
            }
            bomberCanReturn(e) {
              return !this.bomberManeuverTile || this.rangeHelper.tileDistance(e, this.bomberManeuverTile) <= 1;
            }
            findStrafeDestination(t, i) {
              let e = new u.RandomTileFinder(
                this.game.map.tiles,
                this.game.map.mapBounds,
                i,
                this.weapon.range,
                this.game,
                (e) => this.rangeHelper.isInWeaponRange(t, i, this.weapon, this.game.rules, e),
              );
              return e.getNextTile();
            }
            hasReachedDestination(e) {
              // OpenYRWeb: a fighter still weaving toward its target (bombs not yet
              // dropped) must not "arrive" mid-run — if the move child finishes
              // early, the AttackTask's ammo=0 path has no move task to redirect
              // (a is null), so the plane would return to the exit in a straight
              // line instead of the weave-back. Once the run completes, normal
              // arrival applies so fighters can finish and return to base.
              if (this.shouldAirStrafe(e) && !this.runCompleted && (e.ammo || 0) > 0) return !1;
              return super.hasReachedDestination(e) || this.canStopAtTile(e, e.tile, e.onBridge);
            }
            canStopAtTile(t, e, i) {
              if (
                t.zone !== h.ZoneType.Air &&
                this.target instanceof n.GameObject &&
                // OpenYRWeb: a crusher (Battle Fortress) may stop ON a crushable target —
                // it drives onto the victim and crushes it instead of stopping short.
                !t.canCrushObject(this.target) &&
                this.game.map.tileOccupation.isTileOccupiedBy(e, this.target) &&
                (!this.target.isUnit() ||
                  (this.target.tile === e &&
                    this.target.moveTrait.moveState !== r.MoveState.Moving &&
                    this.target.position.subCell === t.position.subCell))
              )
                return !1;
              if (t.zone !== h.ZoneType.Air) {
                if (!super.canStopAtTile(t, e, i)) return !1;
              } else if (
                this.game.map.tileOccupation
                  .getAirObjectsOnTile(e)
                  .filter((e) => e.isUnit() && e.moveTrait.moveState !== r.MoveState.Moving && e !== t).length
              )
                return !1;
              return (
                !(this.isBombingRun(t) && !this.bomberCanReturn(e)) &&
                (!!this.isCancelling() || this.isCloseEnoughToDest(t, e))
              );
            }
            isCloseEnoughToDest(e, t) {
              // OpenYRWeb: crush-on-attack — only "close enough" once the crusher is on
              // the victim's tile (the MoveTrait crushes on tile entry), not merely in
              // weapon range.
              if (this.crushMode) return this.rangeHelper.tileDistance(t, this.targetTile) <= 0.5;
              // OpenYRWeb: the fighter's run is over (it already fired) — it only
              // needs to reach its destination tile; weapon-range checks no longer
              // apply. Bombers keep their own bombing-run logic.
              if (this.runCompleted && !this.isBombingRun(e))
                return this.rangeHelper.tileDistance(t, this.targetTile) <= 1;
              if (e.rules.balloonHover && !e.rules.hoverAttack) {
                // OpenYRWeb: Use pure tile distance (not isInWeaponRange) for balloonHover
                // units. Tile distance is simple Euclidean distance between tile centers,
                // without sub-cell offsets or elevation modifiers that can cause the disc
                // to stop short. Subtract 1 from the threshold so the disc moves one tile
                // closer than the max range, ensuring the weapon can always fire (the firing
                // check uses isInWeaponRange which may return false at the exact range edge).
                if (this.weapon && (this.weapon.rules.isDiskLaser || this.weapon.rules.drainWeapon || this.weapon.range > 0)) {
                  var dist = this.rangeHelper.tileDistance(t, this.target);
                  var closeEnough = dist <= this.weapon.range - 1;
                  // OpenYRWeb: DrainWeapon on a building — the disc is NOT "close
                  // enough" unless it is on the building's centerTile. The AttackTask
                  // enforces this in the Firing state; if we report "close enough"
                  // from an adjacent tile, hasReachedDestination → canStopAtTile
                  // returns true immediately, the MoveInWeaponRangeTask ends without
                  // moving, and we loop back to CheckRange → Firing → centerTile
                  // check fail → CheckRange → … forever.
                  if (closeEnough && this.weapon.rules.drainWeapon && this.target?.isBuilding?.()) {
                    closeEnough = t.rx === this.target.centerTile.rx && t.ry === this.target.centerTile.ry;
                  }
                  return closeEnough && this.losHelper.hasLineOfSight(t, this.target, this.weapon);
                }
                return this.rangeHelper.isInTileRange(t, this.target, 0, 0);
              }
              if (this.weapon.rules.cellRangefinding || !e.isInfantry())
                return (
                  this.rangeHelper.isInWeaponRange(e, this.target, this.weapon, this.game.rules, t) &&
                  this.losHelper.hasLineOfSight(t, this.target, this.weapon)
                );
              var i =
                  e.zone === h.ZoneType.Air
                    ? e.position.computeSubCellOffset(e.position.desiredSubCell)
                    : e.position.getTileOffset(),
                { minRange: r, range: s } = this.rangeHelper.computeWeaponRangeVsTarget(
                  t,
                  this.target,
                  this.weapon,
                  this.game.rules,
                ),
                i = o.Coords.tile3dToWorld(
                  t.rx + i.x / o.Coords.LEPTONS_PER_TILE,
                  t.ry + i.y / o.Coords.LEPTONS_PER_TILE,
                  t.z + e.position.tileElevation,
                );
              return (
                (e.isUnit() && e.rules.movementZone === c.MovementZone.Fly
                  ? this.rangeHelper.isInRange2(i, this.target, r, s)
                  : this.rangeHelper.isInRange3(i, this.target, r, s)) &&
                this.losHelper.hasLineOfSight(t, this.target, this.weapon)
              );
            }
            findRelocationTile(t, e, i) {
              if (i.rules.movementZone !== c.MovementZone.Fly) return super.findRelocationTile(t, e, i);
              {
                var r = this.game.map;
                let e = new u.RandomTileFinder(
                  r.tiles,
                  r.mapBounds,
                  t,
                  1,
                  this.game,
                  (e) => this.isCancelling() || this.isCloseEnoughToDest(i, e),
                );
                return e.getNextTile();
              }
            }
            retarget(e, t) {
              var i = e instanceof n.GameObject ? (e.isBuilding() ? e.centerTile : e.tile) : e;
              (this.bomberManeuverTile
                ? (this.bomberQueuedTargetTile = i)
                : (this.updateTarget(i, t), (this.recalcMinRange = !0)),
                (this.target = e),
                this.options?.ignoredBlockers &&
                  (this.options.ignoredBlockers = e instanceof n.GameObject ? [e] : void 0),
                this.options ?? (this.options = {}),
                (this.options.pathFinderIgnoredBlockers = e instanceof n.GameObject ? [e] : void 0));
            }
            completeRun(e, target, exitTile) {
              // OpenYRWeb: the fighter already fired its weapon mid-run. Stop the endless
              // strafing retarget and turn toward the plane's next destination WHILE still
              // moving (the WingedLocomotor banks at speed), so it does not decelerate to a
              // stop right after firing and then make an abrupt turn:
              //  - airstrike MiGs are redirected to their exit tile and fly straight off;
              //  - other fighters bank around to a point behind the target and head back.
              if (this.runCompleted) return;
              (this.runCompleted = !0);
              // Suppress the min-range relocation on the next tick — it would otherwise
              // re-aim the plane back into weapon range, undoing the exit/return redirect.
              this.recalcMinRange = !1;
              // Fighter with a bombing-style weapon (projectile ROT<=1) manages its own
              // bombing-run maneuver — leave its destination alone.
              if (this.isBombingRun(e)) return;
              this.options = this.options || {};
              if (exitTile) {
                this.options.allowOutOfBoundsTarget = !0;
                this.updateTarget(exitTile, !1);
                return;
              }
              let a = target instanceof n.GameObject ? (target.isBuilding() ? target.centerTile : target.tile) : target,
                t = e.position.getMapPosition(),
                dir = new m.Vector2(a.rx + 0.5, a.ry + 0.5)
                  .clone()
                  .multiplyScalar(o.Coords.LEPTONS_PER_TILE)
                  .sub(t),
                len = dir.length();
              // Point just behind the target (opposite the direction of travel): the plane
              // banks around it at speed and heads back towards its base.
              if (len) dir.setLength(o.Coords.LEPTONS_PER_TILE);
              else dir.copy(p.FacingUtil.toMapCoords(e.direction)).multiplyScalar(-o.Coords.LEPTONS_PER_TILE);
              let dest = new m.Vector2(a.rx + 0.5, a.ry + 0.5)
                  .clone()
                  .multiplyScalar(o.Coords.LEPTONS_PER_TILE)
                  .sub(dir),
                size = this.game.map.tiles.getMapSize();
              dest.x = Math.max(0, Math.min(Math.floor(dest.x / o.Coords.LEPTONS_PER_TILE), size.width - 1));
              dest.y = Math.max(0, Math.min(Math.floor(dest.y / o.Coords.LEPTONS_PER_TILE), size.height - 1));
              let tile = this.game.map.tiles.getByMapCoords(dest.x, dest.y) ?? this.game.map.tiles.getPlaceholderTile(dest.x, dest.y);
              this.updateTarget(tile, !1);
            }
            onTick(s) {
              // OpenYRWeb: crushMode drives straight onto the victim — no min-range
              // repositioning that could pull the crusher off the crushable target.
              if (this.recalcMinRange && !this.crushMode) {
                this.recalcMinRange = !1;
                var e = this.findMinRangeRelocationTile(s, this.targetTile);
                if (e !== this.targetTile) {
                  if (!e) return (this.cancel(), !1);
                  this.updateTarget(e, !!e.onBridgeLandType);
                }
              }
              // OpenYRWeb: vanilla-style weaving approach — the plane does not fly
              // a single straight line at the target. Its destination is the
              // target point plus a lateral (perpendicular) sine-wave offset whose
              // amplitude shrinks as the plane closes in, so the approach weaves
              // like a Z-wave — repeatedly adjusting direction, banking side to
              // side — and homes in on the target without circling. After the
              // bombs drop the plane returns STRAIGHT to the exit behind the base.
              if (this.shouldAirStrafe(s) && !this.isCancelling() && !this.runCompleted && (s.ammo || 0) > 0) {
                var strafeTarget =
                  this.target instanceof n.GameObject
                    ? this.target.isBuilding()
                      ? this.target.centerTile
                      : this.target.tile
                    : this.target;
                var planePos = s.position.getMapPosition();
                var tgtPos = new m.Vector2(
                  (strafeTarget.rx + 0.5) * o.Coords.LEPTONS_PER_TILE,
                  (strafeTarget.ry + 0.5) * o.Coords.LEPTONS_PER_TILE,
                );
                // Each plane aims at its own point near the target — a per-plane
                // random lateral offset and its own random weave phase — so a
                // two-plane strike does not converge onto the same spot and fly in
                // formation; each MiG approaches the building from its own side.
                if (void 0 === this._strafeTargetOffset) {
                  var offsetAngle = Math.random() * Math.PI * 2;
                  var offsetDist = (1 + Math.random() * 2) * o.Coords.LEPTONS_PER_TILE;
                  this._strafeTargetOffset = new m.Vector2(Math.cos(offsetAngle), Math.sin(offsetAngle)).multiplyScalar(
                    offsetDist,
                  );
                  this._strafePhase = Math.random() * Math.PI * 2;
                }
                var weaveCenter = tgtPos.clone().add(this._strafeTargetOffset);
                var weaveDiff = weaveCenter.sub(planePos);
                var weaveDist = weaveDiff.length();
                if (1 < weaveDist) {
                  this._strafePhase += 0.08;
                  var weaveLateral = new m.Vector2(-weaveDiff.y, weaveDiff.x)
                    .normalize()
                    .multiplyScalar(
                      Math.sin(this._strafePhase) *
                        Math.min(2.5, weaveDist * 0.35) *
                        o.Coords.LEPTONS_PER_TILE,
                    );
                  var weaveDest = tgtPos.clone().add(this._strafeTargetOffset).add(weaveLateral);
                  var weaveTile =
                    this.game.map.tiles.getByMapCoords(
                      Math.floor(weaveDest.x / o.Coords.LEPTONS_PER_TILE),
                      Math.floor(weaveDest.y / o.Coords.LEPTONS_PER_TILE),
                    ) || strafeTarget;
                  this.updateTarget(weaveTile, !1);
                } else {
                  this.updateTarget(strafeTarget, !1);
                }
              }
              if (
                this.isBombingRun(s) &&
                  !this.isCancelling() &&
                  (!s.ammo || this.weapon.getBurstsFired() || this.bomberInitialLock) &&
                  !this.bomberManeuverTile
              ) {
                this.bomberInitialLock = !1;
                let e = s.position.getMapPosition();
                var a =
                  this.target instanceof n.GameObject
                    ? this.target.isBuilding()
                      ? this.target.centerTile
                      : this.target.tile
                    : this.target;
                let t = new m.Vector2(a.rx + 0.5, a.ry + 0.5).clone().multiplyScalar(o.Coords.LEPTONS_PER_TILE).sub(e),
                  i = t.length();
                i || (t.copy(p.FacingUtil.toMapCoords(s.direction)), (i = Number.EPSILON));
                let r = e.clone().add(t.setLength(i + 7 * o.Coords.LEPTONS_PER_TILE));
                ((a = r.multiplyScalar(1 / o.Coords.LEPTONS_PER_TILE).floor()),
                  (a = g.bresenham(a.x, a.y, s.tile.rx, s.tile.ry)));
                if (!a.length) throw new Error("Bresenham returned no tiles");
                a = a[0];
                ((this.bomberManeuverTile =
                  this.game.map.tiles.getByMapCoords(a.x, a.y) ?? this.game.map.tiles.getPlaceholderTile(a.x, a.y)),
                  (this.options.allowOutOfBoundsTarget = !0),
                  this.updateTarget(this.bomberManeuverTile, !1));
              }
              return (
                this.bomberManeuverTile &&
                  this.bomberCanReturn(s.tile) &&
                  ((this.bomberManeuverTile = void 0),
                  this.bomberQueuedTargetTile &&
                    (this.updateTarget(this.bomberQueuedTargetTile, !1),
                    (this.recalcMinRange = !0),
                    (this.bomberQueuedTargetTile = void 0))),
                this.cancelRequested && (this.bomberManeuverTile || ((this.cancelRequested = !1), this.cancel())),
                // OpenYRWeb: Mid-flight range check — balloonHover units (e.g.
                // Floating Disc) stop as soon as weapon range is reached, even
                // if the approach-tile waypoint hasn't been reached yet.
                // Uses raw tileDistance instead of isInWeaponRange/isCloseEnoughToDest
                // to avoid edge cases where the complex range calculation returns
                // true slightly outside the nominal weapon range (e.g. when the
                // target is a moving unit with sub-tile offsets).
                // DrainWeapon is excluded — it must reach the building center tile
                // (set via e.centerTile in onStart) for the drain to work.
                !(
                  s.moveTrait &&
                  s.moveTrait.moveState === r.MoveState.Moving &&
                  s.rules.balloonHover &&
                  !s.rules.hoverAttack &&
                  this.weapon &&
                  !this.weapon.rules.drainWeapon &&
                  this.rangeHelper.tileDistance(
                    s.tile,
                    this.target instanceof n.GameObject
                      ? this.target.isBuilding()
                        ? this.target.centerTile
                        : this.target.tile
                      : this.target,
                  ) <= this.weapon.range
                ) ||
                  (s.moveTrait.velocity.set(0, 0, 0),
                  (s.moveTrait.currentWaypoint = void 0),
                  (s.moveTrait.moveState = r.MoveState.ReachedNextWaypoint),
                  (this.path.length = 0)),
                !!(this.isBombingRun(s) && this.isCancelling() && this.forceCancel(s)) || super.onTick(s)
              );
            }
            forceCancel(e) {
              return !this.bomberManeuverTile && super.forceCancel(e);
            }
            findMinRangeRelocationTile(e, t) {
              var { minRange: i, range: r } = this.rangeHelper.computeWeaponRangeVsTarget(
                e,
                this.target,
                this.weapon,
                this.game.rules,
              );
              return e.rules.locomotor === d.LocomotorType.Chrono
                ? this.rangeHelper.isInRange(e, this.target, r - 1, r, this.weapon.rules.cellRangefinding)
                  ? t
                  : (this.findTileInRange(e, t, r - 1, 2 * r) ?? t)
                : this.rangeHelper.isInRange(
                      e,
                      this.target,
                      i,
                      Number.POSITIVE_INFINITY,
                      this.weapon.rules.cellRangefinding,
                    )
                  ? t
                  : this.findTileInRange(e, t, 2 * i, r - i);
            }
            findTileInRange(t, e, i, r) {
              let s = this.game.map;
              var a,
                n = new m.Vector2(t.tile.rx - e.rx, t.tile.ry - e.ry)
                  .setLength(i)
                  .floor()
                  .add(new m.Vector2(e.rx, e.ry));
              let o;
              for (a of g.bresenham(n.x, n.y, e.rx, e.ry)) if (((o = s.tiles.getByMapCoords(a.x, a.y)), o)) break;
              if (o) {
                let e = new l.RadialTileFinder(
                  s.tiles,
                  s.mapBounds,
                  o,
                  { width: 1, height: 1 },
                  0,
                  r,
                  (e) =>
                    this.rangeHelper.isInWeaponRange(t, this.target, this.weapon, this.game.rules, e) &&
                    this.losHelper.hasLineOfSight(e, this.target, this.weapon) &&
                    0 < s.terrain.getPassableSpeed(e, t.rules.speedType, t.isInfantry(), !!e.onBridgeLandType) &&
                    !s.terrain.findObstacles({ tile: e, onBridge: !!e.onBridgeLandType }, t).length,
                );
                return e.getNextTile();
              }
            }
          }),
          e("MoveInWeaponRangeTask", f));
      },
    };
  },
);
