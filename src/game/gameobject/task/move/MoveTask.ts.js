// === Reconstructed SystemJS module: game/gameobject/task/move/MoveTask ===
// deps: ["game/gameobject/task/system/Task","game/gameobject/Infantry","game/type/MovementZone","util/array","game/type/SpeedType","game/gameobject/trait/MoveTrait","game/gameobject/task/system/WaitTicksTask","game/gameobject/task/move/MoveAsideTask","game/gameobject/unit/MovePositionHelper","game/map/tileFinder/RadialTileFinder","game/gameobject/unit/RangeHelper","util/Logger","game/Coords","game/gameobject/task/system/TaskStatus","game/gameobject/unit/ZoneType","game/gameobject/locomotor/LocomotorFactory","game/map/tileFinder/RandomTileFinder","game/event/ObjectTeleportEvent","game/gameobject/trait/interface/NotifyTeleport","game/type/PowerupType","game/gameobject/task/ScatterTask","game/gameobject/unit/VeteranAbility","game/math/Vector2","game/type/LocomotorType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/move/MoveTask",
  [
    "game/gameobject/task/system/Task",
    "game/gameobject/Infantry",
    "game/type/MovementZone",
    "util/array",
    "game/type/SpeedType",
    "game/gameobject/trait/MoveTrait",
    "game/gameobject/task/system/WaitTicksTask",
    "game/gameobject/task/move/MoveAsideTask",
    "game/gameobject/unit/MovePositionHelper",
    "game/map/tileFinder/RadialTileFinder",
    "game/gameobject/unit/RangeHelper",
    "util/Logger",
    "game/Coords",
    "game/gameobject/task/system/TaskStatus",
    "game/gameobject/unit/ZoneType",
    "game/gameobject/locomotor/LocomotorFactory",
    "game/map/tileFinder/RandomTileFinder",
    "game/event/ObjectTeleportEvent",
    "game/gameobject/trait/interface/NotifyTeleport",
    "game/type/PowerupType",
    "game/gameobject/task/ScatterTask",
    "game/gameobject/unit/VeteranAbility",
    "game/math/Vector2",
    "game/type/LocomotorType",
  ],
  function (e, t) {
    "use strict";
    var i, n, v, b, S, w, E, C, c, h, s, a, x, r, O, o, u, A, M, R, P, I, k, d, B, N, j, L, l;
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
          v = e;
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
          E = e;
        },
        function (e) {
          C = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          x = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          O = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          u = e;
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
        function (e) {
          P = e;
        },
        function (e) {
          I = e;
        },
        function (e) {
          k = e;
        },
        function (e) {
          d = e;
        },
      ],
      execute: function () {
        ((B = 1.5),
          (N = 200),
          (j = 40),
          (L = 5),
          (l = class l extends i.Task {
            constructor(e, t, i, r) {
              (super(),
                (this.game = e),
                (this.targetTile = t),
                (this.toBridge = i),
                (this.options = r),
                (this.preventOpportunityFire = !1),
                (this.logger = a.AppLogger.get("move")),
                (this.destinationLeptons = new k.Vector2()),
                (this.currentWaypointLeptons = new k.Vector2()),
                (this.needsPathUpdate = !1),
                (this.allObstaclesAreBlockers = !1),
                (this.blockedPathNodes = []),
                (this.unreachableTargets = []),
                (this.pushTried = !1),
                (this.cancelProcessed = !1),
                (this.cancelRepositionPending = !1),
                (this.targetLinesConfig = { pathNodes: [] }));
            }
            duplicate() {
              return new l(this.game, this.targetTile, this.toBridge, this.options);
            }
            setForceMove(e) {
              e
                ? (this.options ?? (this.options = {}), (this.options.forceMove = !0))
                : this.options?.forceMove && (this.options.forceMove = void 0);
            }
            onStart(e) {
              if (e.moveTrait.currentWaypoint) throw new Error("Nested move tasks are not supported");
              (void 0 === e.moveTrait.locomotor &&
                (e.moveTrait.locomotor = new o.LocomotorFactory(this.game).create(e)),
                e.moveTrait.lastTargetOffset
                  ? (this.targetOffset = e.moveTrait.lastTargetOffset)
                  : (this.targetOffset = this.computeTargetOffset(e)),
                e.moveTrait.lastVelocity && (e.moveTrait.velocity = e.moveTrait.lastVelocity),
                this.path ||
                  (this.groundPathPlan
                    ? (this.groundPathPlan.path[this.groundPathPlan.path.length - 1].tile === e.tile
                        ? (this.path = this.applyGroundPathPlan(this.groundPathPlan))
                        : this.computePath(e, e.moveTrait.locomotor),
                      (this.groundPathPlan = void 0))
                    : this.computePath(e, e.moveTrait.locomotor),
                  (this.targetLinesConfig.isRecalc = !1)),
                this.updateDestination(this.path, this.targetOffset),
                (e.moveTrait.moveState = w.MoveState.ReachedNextWaypoint),
                (e.moveTrait.lastMoveResult = void 0),
                (e.moveTrait.lastTargetOffset = void 0),
                (e.moveTrait.lastVelocity = void 0));
            }
            computeTargetOffset(e) {
              return (
                this.options?.targetOffset ??
                (e.isInfantry() ? e.position.getTileOffset() : e.position.computeSubCellOffset(0))
              );
            }
            computePath(e, t, i = !1) {
              let r;
              if (this.options?.allowOutOfBoundsTarget || this.game.map.mapBounds.isWithinBounds(this.targetTile))
                if (e.rules.movementZone === v.MovementZone.Fly) r = this.computeAirPath(e);
                else if (t.ignoresTerrain) r = this.computeDirectJumpPath(e);
                else {
                  var s = this.computeGroundPath(e);
                  if (i && !s.path.length) return !1;
                  r = this.applyGroundPathPlan(s);
                }
              else r = [];
              return (
                e.rules.movementZone === v.MovementZone.Fly
                  ? ((this.targetLinesConfig.pathNodes = r.map(({ tile: e, onBridge: t }) => ({
                      tile: e,
                      onBridge: t,
                    }))),
                    r.length &&
                      (this.targetLinesConfig.pathNodes[0].onBridge = this.toBridge
                        ? this.game.map.tileOccupation.getBridgeOnTile(this.targetTile)
                        : void 0))
                  : (this.targetLinesConfig.pathNodes = r),
                (this.path = r),
                !0
              );
            }
            computeAirPath(e) {
              return [
                { tile: this.targetTile, onBridge: void 0 },
                { tile: e.tile, onBridge: void 0 },
              ];
            }
            computeDirectJumpPath(t) {
              let i = this.game.map;
              var e = t.onBridge ? i.tileOccupation.getBridgeOnTile(t.tile) : void 0;
              let r = this.targetTile,
                s = this.toBridge ? i.tileOccupation.getBridgeOnTile(this.targetTile) : void 0,
                a = this.options?.ignoredBlockers;
              var n = new h.RadialTileFinder(
                i.tiles,
                i.mapBounds,
                r,
                { width: 1, height: 1 },
                0,
                5,
                (e) =>
                  0 < i.terrain.getPassableSpeed(e, t.rules.speedType, t.isInfantry(), !!e.onBridgeLandType, a) &&
                  !i.terrain
                    .findObstacles({ tile: e, onBridge: !!e.onBridgeLandType }, t)
                    .find((e) => !a?.includes(e.obj)),
              ).getNextTile();
              return n
                ? (n !== r && ((r = n), (s = i.tileOccupation.getBridgeOnTile(r))),
                  [
                    { tile: r, onBridge: s },
                    { tile: t.tile, onBridge: e },
                  ])
                : [];
            }
            computeGroundPath(t) {
              let e = t.tile,
                i = t.onBridge ? this.game.map.tileOccupation.getBridgeOnTile(e) : void 0;
              t.moveTrait.moveState === w.MoveState.Moving &&
                t.moveTrait.currentWaypoint &&
                ((e = t.moveTrait.currentWaypoint.tile), (i = t.moveTrait.currentWaypoint.onBridge));
              let r = { path: [], ignoredBlockers: [], blockedPathNodes: [] };
              const s = this.game.map.getObjectsOnTile(e).find((e) => e.isBuilding());
              if (s && !this.game.map.terrain.getPassableSpeed(e, t.rules.speedType, t.isInfantry(), !1)) {
                var a = this.options?.ignoredBlockers?.includes(s);
                if ((a || r.ignoredBlockers.push(s), !a && s.dockTrait)) {
                  let t = new Set(s.dockTrait?.getAllDockTiles()),
                    e = this.game.map.tileOccupation.calculateTilesForGameObject(s.tile, s);
                  e.filter((e) => !t.has(e)).forEach((e) =>
                    r.blockedPathNodes.push({ node: { tile: e, onBridge: void 0 }, obj: s }),
                  );
                }
              }
              var n = this.game.map
                .getGroundObjectsOnTile(this.targetTile)
                .find(
                  (e) =>
                    (e.isInfantry() || e.isVehicle()) &&
                    e.disguiseTrait?.hasTerrainDisguise() &&
                    !(
                      this.game.alliances.haveSharedIntel(t.owner, e.owner) || e.owner.sharedDetectDisguiseTrait?.has(t)
                    ),
                );
              n &&
                ((a = this.toBridge ? this.game.map.tileOccupation.getBridgeOnTile(this.targetTile) : void 0),
                r.blockedPathNodes.push({ node: { tile: this.targetTile, onBridge: a }, obj: n }));
              let o = [...new Set([...(this.options?.ignoredBlockers ?? []), ...r.ignoredBlockers])],
                l = [...this.blockedPathNodes, ...r.blockedPathNodes];
              n = this.game.map.terrain.computePath(
                t.rules.speedType,
                t.isInfantry(),
                e,
                !!i,
                this.targetTile,
                this.toBridge,
                {
                  maxExpandedNodes: this.allObstaclesAreBlockers
                    ? Math.min(300, this.options?.maxExpandedPathNodes ?? Number.POSITIVE_INFINITY)
                    : this.options?.maxExpandedPathNodes,
                  bestEffort: !this.options?.strictCloseEnough,
                  ignoredBlockers: [...new Set([...o, ...(this.options?.pathFinderIgnoredBlockers ?? [])])],
                  excludeTiles:
                    this.allObstaclesAreBlockers || l.length
                      ? (e) => this.nodeIsBlockedForPathfinding(e, t, o, l)
                      : void 0,
                },
              );
              return ((r.path = n), r);
            }
            nodeIsBlockedForPathfinding(t, e, i, r) {
              return this.allObstaclesAreBlockers
                ? !!this.game.map.terrain.findObstacles(t, e).find((e) => !i?.includes(e.obj))
                : !!r.find(({ node: e }) => e.tile === t.tile && e.onBridge === t.onBridge);
            }
            applyGroundPathPlan(e) {
              var t;
              return (
                (this.blockedPathNodes = this.blockedPathNodes.filter(
                  (e) => e.obj.isSpawned && e.node.tile === e.obj.tile,
                )),
                e.ignoredBlockers.length &&
                  (this.options ?? (this.options = {}),
                  (t = this.options).ignoredBlockers ?? (t.ignoredBlockers = []),
                  this.options.ignoredBlockers.push(...e.ignoredBlockers)),
                this.blockedPathNodes.push(...e.blockedPathNodes),
                e.path
              );
            }
            updateDestination(e, t) {
              var i = e.length ? e[0].tile : this.targetTile;
              this.destinationLeptons.set(i.rx * x.Coords.LEPTONS_PER_TILE, i.ry * x.Coords.LEPTONS_PER_TILE).add(t);
            }
            canStopAtTile(t, i, r) {
              if (t.zone === O.ZoneType.Air) {
                if (
                  (!t.isAircraft() || !t.airportBoundTrait) &&
                  !t.rules.spawned &&
                  (!this.options?.forceMove || !t.rules.balloonHover || t.rules.hoverAttack) &&
                  (!this.game.map.terrain.getPassableSpeed(i, S.SpeedType.Amphibious, !1, r) ||
                    this.game.map
                      .getObjectsOnTile(i)
                      .filter(
                        (e) =>
                          (e.isBuilding() &&
                            !e.isDestroyed &&
                            !e.dockTrait?.hasReservedDockForUnit(t) &&
                            !t.rules.dock.includes(e.name)) ||
                          (e.isUnit() && e.tile === i && e.moveTrait.moveState !== w.MoveState.Moving && e !== t),
                      ).length)
                )
                  return !1;
              } else if (t.isInfantry()) {
                let e = this.game.map
                  .getGroundObjectsOnTile(i)
                  .filter(
                    (e) =>
                      e.isInfantry() &&
                      e.tile === i &&
                      e.onBridge === r &&
                      e.moveTrait.moveState !== w.MoveState.Moving &&
                      e !== t,
                  );
                if (2 < e.length || e.find((e) => e.position.subCell === t.position.subCell)) return !1;
              }
              return (
                !(
                  t.zone !== O.ZoneType.Air &&
                  t.rules.tooBigToFitUnderBridge &&
                  !r &&
                  i.onBridgeLandType &&
                  this.game.map.tileOccupation.getBridgeOnTile(i)?.isHighBridge()
                ) &&
                !(
                  !this.isCancelling() &&
                  this.options?.strictCloseEnough &&
                  void 0 !== this.options?.closeEnoughTiles &&
                  !this.isCloseEnoughToDest(t, i, this.options.closeEnoughTiles)
                )
              );
            }
            isCloseEnoughToDest(e, t, i) {
              if (void 0 === i) return !0;
              let r = new s.RangeHelper(this.game.map.tileOccupation);
              return !(r.tileDistance(this.targetTile, t) > i);
            }
            hasReachedDestination(e) {
              return !this.path.length;
            }
            updateTarget(e, t, i = !1) {
              ((this.needsPathUpdate = !0),
                (this.targetChangeRequested = { tile: e, toBridge: t, onlyIfPathExists: i }));
            }
            onEnd(e) {
              ((e.moveTrait.collisionState = w.CollisionState.Resolved),
                (e.moveTrait.currentWaypoint = void 0),
                this.targetOffset.equals(this.computeTargetOffset(e)) ||
                  (e.moveTrait.lastTargetOffset = this.targetOffset));
            }
            forceCancel(e) {
              return (
                !(!this.cancellable || this.children.some((e) => !e.cancellable)) &&
                !(!this.options?.allowOutOfBoundsTarget && !this.game.map.isWithinBounds(e.tile)) &&
                ((this.status !== r.TaskStatus.Running && this.status !== r.TaskStatus.Cancelling) ||
                  (e.moveTrait.unreservePathNodes(),
                  (e.moveTrait.lastMoveResult = w.MoveResult.Cancel),
                  this.onEnd(e),
                  (e.moveTrait.lastTargetOffset = this.targetOffset),
                  (e.moveTrait.lastVelocity = e.moveTrait.velocity.clone())),
                (this.status = r.TaskStatus.Cancelled),
                !0)
              );
            }
            onTick(s) {
              if (s.moveTrait.isDisabled() && s.moveTrait.moveState === w.MoveState.ReachedNextWaypoint)
                return !!this.isCancelling() && ((s.moveTrait.lastMoveResult = w.MoveResult.Cancel), !0);
              var e;
              this.needsPathUpdate &&
                (s.moveTrait.moveState === w.MoveState.PlanMove &&
                  ((this.inPlanningForTicks = void 0),
                  (s.moveTrait.currentWaypoint = void 0),
                  (s.moveTrait.collisionState = w.CollisionState.Resolved),
                  (s.moveTrait.moveState = w.MoveState.ReachedNextWaypoint),
                  s.moveTrait.velocity.set(0, 0, 0)),
                (e = this.targetTile),
                (r = this.toBridge),
                this.targetChangeRequested &&
                  ((this.targetTile = this.targetChangeRequested.tile),
                  (this.toBridge = this.targetChangeRequested.toBridge)),
                this.computePath(s, s.moveTrait.locomotor, this.targetChangeRequested?.onlyIfPathExists)
                  ? (this.path.length ||
                      this.unreachableTargets.push({ tile: this.targetTile, toBridge: this.toBridge }),
                    this.updateDestination(this.path, this.targetOffset),
                    (this.allObstaclesAreBlockers = !1))
                  : ((this.targetTile = e),
                    (this.toBridge = r),
                    (this.targetLinesConfig.pathNodes = [...this.targetLinesConfig.pathNodes])),
                (this.targetLinesConfig.isRecalc = !this.targetChangeRequested),
                (this.targetChangeRequested = void 0),
                (this.needsPathUpdate = !1));
              let i = this.game.map;
              if (s.moveTrait.moveState === w.MoveState.ReachedNextWaypoint) {
                s.moveTrait.unreservePathNodes();
                var r = this.path.findIndex((e) => e === s.moveTrait.currentWaypoint);
                if (
                  (-1 !== r ? this.path.splice(r) : this.path.pop(),
                  (s.moveTrait.currentWaypoint = void 0),
                  this.isCancelling() ? !this.cancelProcessed : this.hasReachedDestination(s))
                ) {
                  var a = !this.isCancelling() && !this.isCloseEnoughToDest(s, s.tile, this.options?.closeEnoughTiles);
                  if (!a && this.canStopAtTile(s, s.tile, s.onBridge))
                    return (
                      (s.moveTrait.lastMoveResult = this.isCancelling() ? w.MoveResult.Cancel : w.MoveResult.Success),
                      !0
                    );
                  {
                    if (this.unreachableTargets.length > L)
                      return (
                        (s.moveTrait.lastMoveResult = w.MoveResult.Fail),
                        this.log(s, "bail_max_unreachable_dest"),
                        !0
                      );
                    let e = s.tile,
                      t = s.onBridge ? i.tileOccupation.getBridgeOnTile(e) : void 0;
                    a && ((e = this.targetTile), (t = this.toBridge ? i.tileOccupation.getBridgeOnTile(e) : void 0));
                    r = this.findRelocationTile(e, t, s);
                    if (!r)
                      return (
                        (s.moveTrait.lastMoveResult = a ? w.MoveResult.Fail : w.MoveResult.CloseEnough),
                        this.log(s, "bail_no_free_dest"),
                        !0
                      );
                    a = !t || t.isHighBridge() ? i.tileOccupation.getBridgeOnTile(r) : void 0;
                    return (
                      this.updateTarget(r, !!a),
                      this.isCancelling() && ((this.cancelProcessed = !0), (this.cancelRepositionPending = !0)),
                      !1
                    );
                  }
                }
                if (this.cancelProcessed && !this.path.length)
                  return ((s.moveTrait.lastMoveResult = w.MoveResult.Cancel), !0);
                ((this.cancelProcessed = !1), (s.moveTrait.moveState = w.MoveState.PlanMove));
                let e = s.moveTrait.locomotor;
                ((s.moveTrait.currentWaypoint = e.selectNextWaypoint
                  ? e.selectNextWaypoint(s, this.path)
                  : this.path[this.path.length - 1]),
                  this.currentWaypointLeptons
                    .set(s.moveTrait.currentWaypoint.tile.rx, s.moveTrait.currentWaypoint.tile.ry)
                    .multiplyScalar(x.Coords.LEPTONS_PER_TILE)
                    .add(this.targetOffset));
                a = e.onNewWaypoint(s, this.currentWaypointLeptons, this.destinationLeptons);
                if (a) return (this.children.push(...a), !1);
              }
              if (s.moveTrait.moveState === w.MoveState.PlanMove) {
                if (this.isCancelling() && !this.cancelRepositionPending)
                  return (
                    (s.moveTrait.currentWaypoint = void 0),
                    (s.moveTrait.moveState = w.MoveState.ReachedNextWaypoint),
                    this.onTick(s)
                  );
                if (
                  ((this.inPlanningForTicks = void 0 === this.inPlanningForTicks ? 0 : this.inPlanningForTicks + 1),
                  this.inPlanningForTicks > N)
                )
                  return (
                    (this.needsPathUpdate = !0),
                    (this.allObstaclesAreBlockers = !0),
                    s.moveTrait.velocity.set(0, 0, 0),
                    this.log(s, "repath_plan_timeout"),
                    !1
                  );
                if (s.rules.movementZone !== v.MovementZone.Fly && !s.moveTrait.locomotor.ignoresTerrain) {
                  let t = this.path.slice(this.path.indexOf(s.moveTrait.currentWaypoint)).reverse();
                  var n,
                    o,
                    l,
                    c = s.moveTrait.velocity.length();
                  for (n of t) n.onBridge?.isDestroyed && (n.onBridge = void 0);
                  for (o of t) {
                    if (
                      !i.terrain.getPassableSpeed(
                        o.tile,
                        s.rules.speedType,
                        s.isInfantry(),
                        !!o.onBridge,
                        this.options?.ignoredBlockers,
                      )
                    )
                      return this.options?.stopOnBlocker &&
                        i.terrain.findObstacles(o, s).some((e) => e.obj === this.options.stopOnBlocker)
                        ? ((s.moveTrait.lastMoveResult = w.MoveResult.CloseEnough), !0)
                        : ((this.needsPathUpdate = !0),
                          (s.moveTrait.currentWaypoint = void 0),
                          (s.moveTrait.moveState = w.MoveState.ReachedNextWaypoint),
                          this.onTick(s));
                    if (!o.onBridge) {
                      var h = i.getGroundObjectsOnTile(o.tile).find((e) => e.isOverlay() && e.rules.crate);
                      if (h)
                        if (this.game.crateGeneratorTrait.peekInsideCrate(h) === R.PowerupType.Unit) {
                          this.game.crateGeneratorTrait.pickupCrate(s, h, this.game);
                          h = this.game.map.getGroundObjectsOnTile(o.tile).find((e) => e.isUnit() && !e.onBridge);
                          if (h)
                            return (
                              (this.needsPathUpdate = !0),
                              this.blockedPathNodes.push({ node: o, obj: h }),
                              (s.moveTrait.currentWaypoint = void 0),
                              (s.moveTrait.moveState = w.MoveState.ReachedNextWaypoint),
                              this.onTick(s)
                            );
                        }
                    }
                    for (l of i.terrain
                      .findObstacles(o, s)
                      .filter((e) => !this.options?.ignoredBlockers?.includes(e.obj))) {
                      if (l.static)
                        return (
                          (this.needsPathUpdate = !0),
                          (s.moveTrait.currentWaypoint = void 0),
                          (s.moveTrait.moveState = w.MoveState.ReachedNextWaypoint),
                          this.onTick(s)
                        );
                      if (l.obj.rules.crushable) {
                        if (
                          [S.SpeedType.Track, S.SpeedType.Hover].includes(s.rules.speedType) &&
                          s.crusher &&
                          (!l.obj.isTechno() || !this.game.areFriendly(l.obj, s))
                        )
                          continue;
                        if (!l.obj.isTechno())
                          return (
                            (this.needsPathUpdate = !0),
                            (s.moveTrait.currentWaypoint = void 0),
                            (s.moveTrait.moveState = w.MoveState.ReachedNextWaypoint),
                            this.onTick(s)
                          );
                      }
                      if (l.obj.isTerrain()) {
                        if (!s.isInfantry())
                          throw new Error(`Obstacle ${l.obj.name} should be a blocker for non infantry`);
                        var u = this.findFreeSubCell(s, o);
                        return (
                          void 0 !== u
                            ? this.relocateToSubCell(s, u)
                            : ((this.needsPathUpdate = !0),
                              this.blockedPathNodes.push({ node: o, obj: l.obj }),
                              (s.moveTrait.currentWaypoint = void 0),
                              (s.moveTrait.moveState = w.MoveState.ReachedNextWaypoint)),
                          this.onTick(s)
                        );
                      }
                      if (!l.obj.isTechno()) throw new Error("Unexpected obstacle of type " + l.obj.type);
                      const T = l.obj;
                      var d = T.isUnit() ? T.moveTrait.velocity.length() : 0;
                      if (
                        !T.isAircraft() ||
                        T.zone !== O.ZoneType.Ground ||
                        !this.options?.ignoredBlockers?.some((e) => e.isBuilding() && e.dockTrait?.isDocked(T))
                      ) {
                        if (
                          1 === t.length &&
                          T.isUnit() &&
                          d &&
                          c &&
                          c <= d &&
                          s.direction === T.direction &&
                          T.tile === o.tile &&
                          T.moveTrait.currentWaypoint?.tile !== o.tile
                        )
                          break;
                        if (
                          T.isBuilding() ||
                          T.moveTrait.moveState === w.MoveState.Idle ||
                          T.moveTrait.collisionState !== w.CollisionState.Resolved
                        ) {
                          if (
                            !c &&
                            s.moveTrait.collisionState !== w.CollisionState.Resolved &&
                            T.isUnit() &&
                            T.moveTrait.collisionState !== w.CollisionState.Resolved
                          )
                            return (
                              this.inPlanningForTicks + 1 > N &&
                                ((this.needsPathUpdate = !0),
                                (this.allObstaclesAreBlockers = !0),
                                this.log(s, "repath_waited_too_long_blocker " + T.id),
                                s.moveTrait.velocity.set(0, 0, 0)),
                              !1
                            );
                          {
                            if (
                              T.isInfantry() &&
                              s.isInfantry() &&
                              T.moveTrait.collisionState === w.CollisionState.Resolved
                            ) {
                              var g = this.findFreeSubCell(s, o);
                              if (void 0 !== g) return (this.relocateToSubCell(s, g), this.onTick(s));
                            }
                            u = b.findIndexReverse(
                              this.path.slice(0, this.path.indexOf(o)),
                              (e) =>
                                !i.terrain
                                  .findObstacles(e, s)
                                  .filter((e) => !this.options?.ignoredBlockers?.includes(e.obj)).length,
                            );
                            if (-1 === u) {
                              if (
                                this.canStopAtTile(s, s.tile, s.onBridge) &&
                                this.isCloseEnoughToDest(s, s.tile, this.options?.closeEnoughTiles)
                              )
                                return (
                                  (s.moveTrait.lastMoveResult = w.MoveResult.CloseEnough),
                                  this.log(s, "bail_waypoints_blocked_close_enough"),
                                  !0
                                );
                              if (!(
                                0 === this.options?.closeEnoughTiles ||
                                (Math.abs(s.tile.rx - this.targetTile.rx) <= 1 &&
                                  Math.abs(s.tile.ry - this.targetTile.ry) <= 1)
                              ))
                                return (
                                  (this.needsPathUpdate = !0),
                                  this.blockedPathNodes.push(
                                    ...this.path
                                      .slice(0, this.path.indexOf(o) + 1)
                                      .map((e) => ({ node: e, obj: i.terrain.findObstacles(e, s)[0].obj })),
                                  ),
                                  s.moveTrait.velocity.set(0, 0, 0),
                                  this.log(s, "repath_waypoints_blocked_too_far"),
                                  !1
                                );
                            }
                            let e;
                            if (
                              ((e =
                                -1 !== u
                                  ? ((g = this.path[u]),
                                    i.terrain.computePath(
                                      s.rules.speedType,
                                      s.isInfantry(),
                                      s.tile,
                                      s.onBridge,
                                      g.tile,
                                      !!g.onBridge,
                                      {
                                        maxExpandedNodes: 15,
                                        bestEffort: !1,
                                        excludeTiles: (e) =>
                                          !!i.terrain
                                            .findObstacles(e, s)
                                            .filter((e) => !this.options?.ignoredBlockers?.includes(e.obj)).length,
                                        ignoredBlockers: this.options?.ignoredBlockers,
                                      },
                                    ))
                                  : []),
                              e.length || T.owner !== s.owner || 1 !== t.length)
                            )
                              return e.length
                                ? (this.path.splice(u, this.path.length, ...e),
                                  (s.moveTrait.currentWaypoint = void 0),
                                  (s.moveTrait.moveState = w.MoveState.ReachedNextWaypoint),
                                  this.onTick(s))
                                : ((p = this.selectWeaponVsObstacle(s, T))
                                    ? (this.children.push(
                                        s.attackTrait.createAttackTask(this.game, T, T.tile, p, {
                                          passive: !0,
                                          holdGround: !0,
                                        }),
                                      ),
                                      s.moveTrait.velocity.set(0, 0, 0))
                                    : this.options?.forceWaitOnPathBlocked
                                      ? (this.children.push(new E.WaitTicksTask(j)),
                                        (this.inPlanningForTicks = 0),
                                        s.moveTrait.velocity.set(0, 0, 0),
                                        (s.moveTrait.collisionState = w.CollisionState.Waiting))
                                      : ((this.needsPathUpdate = !0),
                                        this.blockedPathNodes.push({ node: o, obj: T }),
                                        T.isBuilding() && (this.allObstaclesAreBlockers = !0),
                                        this.log(s, "repath_unavoidable_blocker " + T.id),
                                        s.moveTrait.velocity.set(0, 0, 0)),
                                  !1);
                            p = T.unitOrderTrait.hasTasks();
                            if (
                              this.pushTried ||
                              T.isBuilding() ||
                              T.moveTrait.collisionState === w.CollisionState.Waiting ||
                              p ||
                              (T.isAircraft() && T.missileSpawnTrait)
                            )
                              return (
                                !this.options?.forceWaitOnPathBlocked &&
                                (T.isBuilding() ||
                                  (p && T.moveTrait.moveState === w.MoveState.Idle) ||
                                  this.inPlanningForTicks + j > N)
                                  ? ((this.needsPathUpdate = !0),
                                    (this.allObstaclesAreBlockers = !0),
                                    this.log(s, "repath_blocker_busy_wait_timeout " + T.id),
                                    s.moveTrait.velocity.set(0, 0, 0))
                                  : (this.children.push(new E.WaitTicksTask(j)),
                                    this.options?.forceWaitOnPathBlocked
                                      ? (this.inPlanningForTicks = 0)
                                      : (this.inPlanningForTicks += j),
                                    s.moveTrait.velocity.set(0, 0, 0),
                                    (s.moveTrait.collisionState = w.CollisionState.Waiting)),
                                !1
                              );
                            p = new k.Vector2(T.tile.rx - s.tile.rx, T.tile.ry - s.tile.ry);
                            return (
                              (this.pushTried = !0),
                              T.unitOrderTrait.addTask(new C.MoveAsideTask(this.game, p)),
                              this.children.push(new E.WaitTicksTask(1)),
                              s.moveTrait.velocity.set(0, 0, 0),
                              (s.moveTrait.collisionState = w.CollisionState.Waiting),
                              this.log(s, "push " + T.id),
                              !1
                            );
                          }
                        }
                        if (T.isInfantry() && s.isInfantry()) {
                          var p = this.findFreeSubCell(s, o);
                          if (void 0 !== p) return (this.relocateToSubCell(s, p), this.onTick(s));
                        }
                        if (!c)
                          return (
                            this.inPlanningForTicks > j && (s.moveTrait.collisionState = w.CollisionState.Waiting),
                            !1
                          );
                        if (180 === Math.abs(s.direction - T.direction))
                          return (
                            s.moveTrait.velocity.set(0, 0, 0),
                            (s.moveTrait.collisionState = w.CollisionState.Waiting),
                            !1
                          );
                        if (Math.abs(s.direction - T.direction) <= 45 && d * B < c) {
                          d = this.path.indexOf(o);
                          if (5 <= d) {
                            let e = b.findIndexReverse(
                              this.path.slice(0, d - 5),
                              (e) => !i.terrain.findObstacles(e, s).length,
                            );
                            if (-1 !== e) {
                              ((d = this.path[e]),
                                (d = i.terrain.computePath(
                                  s.rules.speedType,
                                  s.isInfantry(),
                                  s.tile,
                                  s.onBridge,
                                  d.tile,
                                  !!d.onBridge,
                                  {
                                    maxExpandedNodes: 15,
                                    bestEffort: !1,
                                    excludeTiles: (t) =>
                                      !!i.terrain.findObstacles(t, s).length ||
                                      this.path.findIndex((e) => e.tile === t.tile && e.onBridge === t.onBridge) > e,
                                  },
                                )));
                              if (d.length)
                                return (
                                  this.path.splice(e, this.path.length, ...d),
                                  (s.moveTrait.currentWaypoint = void 0),
                                  (s.moveTrait.moveState = w.MoveState.ReachedNextWaypoint),
                                  this.onTick(s)
                                );
                            }
                          }
                          return (
                            (s.moveTrait.collisionState = w.CollisionState.Waiting),
                            s.moveTrait.velocity.set(0, 0, 0),
                            !1
                          );
                        }
                        return (
                          s.moveTrait.velocity.set(0, 0, 0),
                          (s.moveTrait.collisionState = w.CollisionState.Waiting),
                          !1
                        );
                      }
                    }
                  }
                  if (s.rules.speedType === S.SpeedType.Track && c) {
                    var m,
                      f = this.path.indexOf(s.moveTrait.currentWaypoint);
                    if (0 < f) {
                      let t = this.path[f - 1];
                      for (m of i
                        .getGroundObjectsOnTile(t.tile)
                        .filter(
                          (e) =>
                            e.isUnit() &&
                            e.onBridge === !!t.onBridge &&
                            e.rules.crushable &&
                            e.veteranTrait?.hasVeteranAbility(I.VeteranAbility.SCATTER) &&
                            !this.game.areFriendly(e, s),
                        ))
                        m.unitOrderTrait.hasTasks() || m.unitOrderTrait.addTask(new P.ScatterTask(this.game));
                    }
                  }
                  s.moveTrait.reservedPathNodes.length ||
                    (s.moveTrait.reservedPathNodes.push(...t),
                    t.forEach((e) => {
                      i.tileOccupation.occupySingleTile(e.tile, s);
                    }));
                }
                ((s.moveTrait.moveState = w.MoveState.Moving),
                  (this.inPlanningForTicks = void 0),
                  (this.unreachableTargets.length = 0),
                  (this.pushTried = !1),
                  s.moveTrait.collisionState === w.CollisionState.Waiting &&
                    (s.moveTrait.collisionState = w.CollisionState.Resolved));
              }
              if (s.moveTrait.moveState === w.MoveState.Moving) {
                let e = s.moveTrait.locomotor,
                  {
                    distance: t,
                    done: i,
                    isTeleport: r,
                  } = e.tick(
                    s,
                    this.currentWaypointLeptons,
                    this.destinationLeptons,
                    (this.isCancelling() || !this.path.length) && !this.cancelRepositionPending,
                  );
                if (
                  (r &&
                    s.traits.filter(M.NotifyTeleport).forEach((e) => {
                      e[M.NotifyTeleport.onBeforeTeleport](s, this.game, !0, !0);
                    }),
                  t.length())
                ) {
                  ((a = s.tile), (f = e.allowOutOfBounds));
                  if (
                    (t.y
                      ? ((y = s.tileElevation),
                        s.position.moveByLeptons3(t, f),
                        s.moveTrait.handleElevationChange(y, this.game))
                      : s.position.moveByLeptons(t.x, t.z, f),
                    s.tile !== a)
                  ) {
                    var y = s.onBridge ? this.game.map.tileOccupation.getBridgeOnTile(a) : void 0,
                      f = b.findReverse(this.path, (e) => e.tile === s.tile);
                    let e = f
                      ? f.onBridge
                      : y || s.moveTrait.currentWaypoint.onBridge
                        ? this.game.map.tileOccupation.getBridgeOnTile(s.tile)
                        : void 0;
                    if (
                      (e?.isDestroyed && (e = void 0),
                      s.moveTrait.handleTileChange(a, e, !1, this.game, r),
                      r &&
                        ((s.moveTrait.lastTeleportTick = this.game.currentTick),
                        this.game.events.dispatch(new A.ObjectTeleportEvent(s, !0, a))),
                      s.isDestroyed)
                    )
                      return !0;
                  }
                }
                if (i) return ((s.moveTrait.moveState = w.MoveState.ReachedNextWaypoint), this.onTick(s));
              }
              return !1;
            }
            selectWeaponVsObstacle(e, t) {
              let i;
              if (
                !this.game.areFriendly(t, e) &&
                e.attackTrait &&
                !e.attackTrait.isDisabled() &&
                e.attackTrait.isIdle() &&
                (i = e.attackTrait.selectWeaponVersus(e, t, this.game, !1, !0)) &&
                i.name !== e.armedTrait?.deathWeapon?.name &&
                (!i.rules.limboLaunch || !i.warhead.rules.parasite) &&
                !i.warhead.rules.mindControl
              )
                return i;
            }
            findRelocationTile(a, n, o) {
              let l = this.game.map,
                i;
              if (o.rules.movementZone === v.MovementZone.Fly) {
                var t = (e) =>
                  !l.tileOccupation
                    .getGroundObjectsOnTile(e)
                    .some(
                      (e) => (e.isBuilding() && !e.isDestroyed) || e.isTerrain() || (e.isOverlay() && e.rules.isARock),
                    ) &&
                  (o.rules.locomotor !== d.LocomotorType.Jumpjet ||
                    0 <
                      this.game.map.terrain.getPassableSpeed(
                        e,
                        S.SpeedType.Amphibious,
                        o.isInfantry(),
                        !!e.onBridgeLandType,
                      ));
                let e = new u.RandomTileFinder(l.tiles, l.mapBounds, a, 1, this.game, t);
                if (((i = e.getNextTile()), !i)) {
                  let e = new h.RadialTileFinder(l.tiles, l.mapBounds, a, o.getFoundation(), 2, 15, t);
                  i = e.getNextTile();
                }
              } else {
                let e =
                    !this.options?.ignoredBlockers?.length &&
                    l.terrain.getPassableSpeed(o.tile, o.rules.speedType, o.isInfantry(), o.onBridge)
                      ? this.game.map.terrain.getIslandIdMap(o.rules.speedType, o.isInfantry())
                      : void 0,
                  r = e?.get(o.tile, o.onBridge),
                  s = new c.MovePositionHelper(l),
                  t = new h.RadialTileFinder(l.tiles, l.mapBounds, a, { width: 1, height: 1 }, 0, 5, (t) => {
                    let i = !n || n.isHighBridge() ? l.tileOccupation.getBridgeOnTile(t) : void 0;
                    return (
                      !this.unreachableTargets.find((e) => e.tile === t && e.toBridge === !!i) &&
                      (o.zone === O.ZoneType.Air ||
                        (e?.get(t, !!i) === r &&
                          !l.terrain.findObstacles({ tile: t, onBridge: i }, o).length &&
                          s.isEligibleTile(t, i, n, a))) &&
                      this.canStopAtTile(o, t, !!i)
                    );
                  });
                i = t.getNextTile();
              }
              return i;
            }
            findFreeSubCell(t, i) {
              let e = this.game.map.getGroundObjectsOnTile(i.tile);
              var r = e
                  .filter((e) => e.isInfantry() && e.onBridge === !!i.onBridge && e !== t)
                  .map((e) => e.position.desiredSubCell),
                s = e
                  .filter((e) => e.isTerrain())
                  .map((e) => e.rules.getOccupiedSubCells(this.game.map.getTheaterType()))
                  .flat();
              let a = [...r, ...s];
              return n.Infantry.SUB_CELLS.find((e) => -1 === a.indexOf(e));
            }
            relocateToSubCell(e, t) {
              e.position.desiredSubCell = t;
              var i = e.position.computeSubCellOffset(t);
              ((this.targetOffset = i),
                this.currentWaypointLeptons
                  .set(e.moveTrait.currentWaypoint.tile.rx, e.moveTrait.currentWaypoint.tile.ry)
                  .multiplyScalar(x.Coords.LEPTONS_PER_TILE)
                  .add(this.targetOffset),
                this.updateDestination(this.path, this.targetOffset),
                e.moveTrait.locomotor.onWaypointUpdate?.(e, this.currentWaypointLeptons, this.destinationLeptons));
            }
            getTargetLinesConfig(e) {
              var t, i;
              return (
                this.path ||
                  ((t = new o.LocomotorFactory(this.game).create(e)),
                  (this.options?.allowOutOfBoundsTarget || this.game.map.mapBounds.isWithinBounds(this.targetTile)) &&
                  e.rules.movementZone !== v.MovementZone.Fly &&
                  !t.ignoresTerrain &&
                  e.unitOrderTrait.getCurrentTask()?.isCancelling()
                    ? this.groundPathPlan ||
                      ((i = this.computeGroundPath(e)),
                      (this.targetLinesConfig.pathNodes = i.path),
                      i.path.length && (this.groundPathPlan = i))
                    : ((i = e.moveTrait).locomotor ?? (i.locomotor = t), this.computePath(e, e.moveTrait.locomotor)),
                  (this.targetLinesConfig.isRecalc = !1)),
                this.targetLinesConfig
              );
            }
            log(e, t) {
              this.logger.debug(`<${e.id}>: ` + t);
            }
          }),
          e("MoveTask", l));
      },
    };
  },
);
