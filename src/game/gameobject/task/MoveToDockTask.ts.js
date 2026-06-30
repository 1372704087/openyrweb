// === Reconstructed SystemJS module: game/gameobject/task/MoveToDockTask ===
// deps: ["game/gameobject/task/system/Task","game/map/tileFinder/RadialTileFinder","game/gameobject/task/move/MoveTask","game/gameobject/task/system/WaitMinutesTask","game/gameobject/task/system/CallbackTask","game/gameobject/trait/MoveTrait","game/type/MovementZone","game/gameobject/trait/interface/NotifyTick","game/Coords","game/math/Vector2"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/MoveToDockTask",
  [
    "game/gameobject/task/system/Task",
    "game/map/tileFinder/RadialTileFinder",
    "game/gameobject/task/move/MoveTask",
    "game/gameobject/task/system/WaitMinutesTask",
    "game/gameobject/task/system/CallbackTask",
    "game/gameobject/trait/MoveTrait",
    "game/type/MovementZone",
    "game/gameobject/trait/interface/NotifyTick",
    "game/Coords",
    "game/math/Vector2",
  ],
  function (t, e) {
    "use strict";
    var i, r, s, a, n, o, l, c, h, u, d, g;
    e && e.id;
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
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
      ],
      execute: function () {
        var e;
        (((e = d = d || {})[(e.Idle = 0)] = "Idle"),
          (e[(e.MoveToQueueingTile = 1)] = "MoveToQueueingTile"),
          (e[(e.WaitForTurn = 2)] = "WaitForTurn"),
          (e[(e.MoveToDock = 3)] = "MoveToDock"),
          (e[(e.Docking = 4)] = "Docking"),
          (e[(e.Docked = 5)] = "Docked"),
          (g = class extends i.Task {
            constructor(e, t) {
              (super(),
                (this.game = e),
                (this.target = t),
                (this.useChildTargetLines = !0),
                (this.preventOpportunityFire = !1),
                (this.dockingStatus = d.Idle));
            }
            onStart(e) {
              if (!this.target.dockTrait) throw new Error(`Target object "${this.target.name}" is not a valid dock`);
              var t;
              this.target.dockTrait.hasReservedDockForUnit(e)
                ? (this.dockingStatus = d.MoveToDock)
                : void 0 !== (t = this.target.dockTrait.getFirstAvailableDockNumber())
                  ? (this.target.dockTrait.reserveDockAt(e, t), (this.dockingStatus = d.MoveToDock))
                  : this.target.helipadTrait
                    ? this.cancel()
                    : (this.dockingStatus = d.MoveToQueueingTile);
            }
            onEnd(e) {
              (this.dockingStatus !== d.Docked &&
                this.target.isSpawned &&
                (this.target.dockTrait.undockUnit(e), this.target.dockTrait.unreserveDockForUnit(e)),
                (this.dockingStatus = d.Idle));
            }
            onTick(e) {
              if (this.isCancelling()) return !0;
              if (!this.isValidTarget(this.target, e)) return !0;
              if (this.dockingStatus === d.MoveToQueueingTile) {
                var t = this.findReachableQueueingTile(e);
                if (!t) return !0;
                if (e.tile !== t)
                  return (
                    this.children.push(
                      new s.MoveTask(this.game, t, !1, { closeEnoughTiles: 5 }),
                      new n.CallbackTask(() => {
                        e.moveTrait.lastMoveResult === o.MoveResult.Fail
                          ? this.cancel()
                          : e.moveTrait.lastMoveResult === o.MoveResult.CloseEnough &&
                            (this.game.map.tileOccupation.isTileOccupiedBy(e.tile, this.target) ||
                              (this.dockingStatus = d.WaitForTurn));
                      }),
                    ),
                    !1
                  );
                this.dockingStatus = d.WaitForTurn;
              }
              if (this.dockingStatus === d.WaitForTurn) {
                var i = this.target.dockTrait.getFirstAvailableDockNumber();
                if (void 0 === i) return (this.children.push(new a.WaitMinutesTask(1 / 60)), !1);
                (this.target.dockTrait.reserveDockAt(e, i), (this.dockingStatus = d.MoveToDock));
              }
              if (this.dockingStatus === d.MoveToDock) {
                var r = this.target.dockTrait.getReservedDockForUnit(e),
                  i = this.target.dockTrait.getDockTile(r),
                  r = h.Coords.vecWorldToGround(this.target.dockTrait.getDockOffset(r))
                    .add(this.target.position.getMapPosition())
                    .sub(new u.Vector2(i.rx, i.ry).multiplyScalar(h.Coords.LEPTONS_PER_TILE));
                if (e.tile !== i)
                  return (
                    this.children.push(
                      new s.MoveTask(this.game, i, !1, {
                        targetOffset: e.isAircraft() ? r : void 0,
                        closeEnoughTiles: 0,
                        strictCloseEnough: !0,
                      }),
                      new n.CallbackTask(() => {
                        e.moveTrait.lastMoveResult === o.MoveResult.Fail && this.cancel();
                      }),
                    ),
                    this.game.afterTick(() => e.unitOrderTrait[c.NotifyTick.onTick](e, this.game)),
                    !1
                  );
                this.dockingStatus = d.Docking;
              }
              if (this.dockingStatus !== d.Docking) return !1;
              r = this.target.dockTrait.getReservedDockForUnit(e);
              return (
                this.target.dockTrait.unreserveDockForUnit(e),
                this.target.dockTrait.dockUnitAt(e, r),
                e.isAircraft() &&
                  e.airportBoundTrait &&
                  this.target.helipadTrait &&
                  (e.airportBoundTrait.preferredAirport = this.target),
                (this.dockingStatus = d.Docked),
                !0
              );
            }
            isValidTarget(e, t) {
              return e.isSpawned && this.game.areFriendly(e, t);
            }
            findReachableQueueingTile(t) {
              var e = this.target.getFoundation(),
                e = new u.Vector2(this.target.tile.rx + e.width, this.target.tile.ry + e.height),
                e = this.game.map.tiles.getByMapCoords(e.x, e.y);
              return e && this.isValidQueueingTile(e, t)
                ? e
                : new r.RadialTileFinder(
                    this.game.map.tiles,
                    this.game.map.mapBounds,
                    this.target.tile,
                    this.target.getFoundation(),
                    1,
                    1,
                    (e) => this.isValidQueueingTile(e, t),
                  ).getNextTile();
            }
            isValidQueueingTile(e, t) {
              var i = t.rules.movementZone === l.MovementZone.Fly,
                r = t.rules.speedType,
                s = t.isInfantry();
              let a =
                !i && this.game.map.terrain.getPassableSpeed(t.tile, r, s, t.onBridge)
                  ? this.game.map.terrain.getIslandIdMap(r, s)
                  : void 0;
              return (
                (i ||
                  (a?.get(e, !1) === a?.get(t.tile, t.onBridge) &&
                    Math.abs(e.z - this.target.tile.z) < 2 &&
                    !e.onBridgeLandType &&
                    !this.game.map.terrain.findObstacles({ tile: e, onBridge: void 0 }, t).length)) &&
                !this.game.map.tileOccupation.isTileOccupiedBy(e, this.target)
              );
            }
          }),
          t("MoveToDockTask", g));
      },
    };
  },
);
