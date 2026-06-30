// === Reconstructed SystemJS module: game/gameobject/task/harvester/ReturnOreTask ===
// deps: ["game/gameobject/task/system/Task","game/gameobject/unit/RangeHelper","game/map/tileFinder/RadialTileFinder","game/gameobject/task/move/MoveTask","game/gameobject/task/TurnTask","game/gameobject/task/system/WaitMinutesTask","game/gameobject/trait/HarvesterTrait","game/gameobject/task/harvester/TeleportMoveToRefineryTask","game/gameobject/task/harvester/GatherOreTask","game/gameobject/task/system/CallbackTask","game/gameobject/trait/MoveTrait","game/gameobject/unit/ZoneType","game/math/Vector2"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/harvester/ReturnOreTask",
  [
    "game/gameobject/task/system/Task",
    "game/gameobject/unit/RangeHelper",
    "game/map/tileFinder/RadialTileFinder",
    "game/gameobject/task/move/MoveTask",
    "game/gameobject/task/TurnTask",
    "game/gameobject/task/system/WaitMinutesTask",
    "game/gameobject/trait/HarvesterTrait",
    "game/gameobject/task/harvester/TeleportMoveToRefineryTask",
    "game/gameobject/task/harvester/GatherOreTask",
    "game/gameobject/task/system/CallbackTask",
    "game/gameobject/trait/MoveTrait",
    "game/gameobject/unit/ZoneType",
    "game/math/Vector2",
  ],
  function (e, t) {
    "use strict";
    var i, s, r, l, c, h, u, d, g, p, m, o, a, n;
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
          r = e;
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
          o = e;
        },
        function (e) {
          a = e;
        },
      ],
      execute: function () {
        ((n = class extends i.Task {
          constructor(e, t, i = !1, r = !1) {
            (super(),
              (this.game = e),
              (this.forceTarget = t),
              (this.resetLastOreSite = i),
              (this.explicitOrder = r),
              (this.useChildTargetLines = !0),
              (this.preventOpportunityFire = !1),
              (this.rangeHelper = new s.RangeHelper(e.map.tileOccupation)));
          }
          onStart(e) {
            if (!e.isVehicle() || !e.harvesterTrait) throw new Error(`Unit ${e.name} is not a harvester.`);
            ((e.harvesterTrait.status = u.HarvesterStatus.MovingToRefinery),
              this.resetLastOreSite && (e.harvesterTrait.lastOreSite = void 0));
          }
          onEnd(e) {
            (this.target?.isSpawned &&
              (this.target.dockTrait.undockUnit(e), this.target.dockTrait.unreserveDockForUnit(e)),
              e.harvesterTrait.status !== u.HarvesterStatus.LookingForRefinery &&
                (e.harvesterTrait.status = u.HarvesterStatus.Idle));
          }
          onTick(r) {
            if (this.isCancelling()) return !0;
            let s = r.harvesterTrait;
            if (s.status === u.HarvesterStatus.LookingForRefinery) return !0;
            if (s.status === u.HarvesterStatus.MovingToRefinery) {
              if (
                !this.target ||
                !this.isValidTargetRefinery(this.target, r) ||
                r.tile !== this.findRefineryDockingTile(this.target)
              ) {
                var a = this.forceTarget ?? this.findClosestReachableRefinery(r);
                if (!a) return ((s.status = u.HarvesterStatus.LookingForRefinery), !0);
                (this.target &&
                  this.target !== a &&
                  this.target.dockTrait.hasReservedDockForUnit(r) &&
                  this.target.dockTrait.unreserveDockForUnit(r),
                  (this.target = a));
              }
              let e = this.target.dockTrait.getFirstAvailableDockNumber(),
                t = !1;
              void 0 === e &&
                ((e = this.target.dockTrait.getFirstEmptyDockNumber()),
                void 0 !== e && (t = !this.target.dockTrait.hasReservedDockForUnit(r)));
              let i = this.findRefineryDockingTile(this.target);
              var n = this.rangeHelper.tileDistance(r, i);
              if (void 0 === e || t || (n > this.game.rules.general.harvesterTooFarDistance && !this.explicitOrder)) {
                var o = this.findReachableQueueingTile(r);
                return o
                  ? (r.tile !== o &&
                      this.children.push(
                        r.rules.teleporter
                          ? new d.TeleportMoveToRefineryTask(this.game, i, o, () =>
                              this.chronoMinerCanTeleport(r, i, this.target),
                            )
                          : new l.MoveTask(this.game, o, !1),
                        new p.CallbackTask(() => {
                          r.moveTrait.lastMoveResult === m.MoveResult.Fail
                            ? (s.status = u.HarvesterStatus.LookingForRefinery)
                            : r.moveTrait.lastMoveResult === m.MoveResult.CloseEnough
                              ? this.children.push(new h.WaitMinutesTask(5 / 60))
                              : r.moveTrait.lastMoveResult === m.MoveResult.Success &&
                                this.children.push(new h.WaitMinutesTask(2 / 60));
                        }),
                      ),
                    !1)
                  : !0;
              }
              if (
                (this.target.dockTrait.hasReservedDockForUnit(r) || this.target.dockTrait.reserveDockAt(r, e),
                void 0 === this.reservedDockNumber &&
                  (this.reservedDockNumber = this.target.dockTrait.getReservedDockForUnit(r)),
                r.tile !== i)
              )
                return (
                  this.children.push(
                    r.rules.teleporter
                      ? new d.TeleportMoveToRefineryTask(this.game, i, void 0, () =>
                          this.chronoMinerCanTeleport(r, i, this.target),
                        )
                      : new l.MoveTask(this.game, i, !1, { closeEnoughTiles: 0, strictCloseEnough: !0 }),
                    new p.CallbackTask(() => {
                      r.moveTrait.lastMoveResult === m.MoveResult.Fail &&
                        (s.status = u.HarvesterStatus.LookingForRefinery);
                    }),
                  ),
                  !1
                );
              s.status = u.HarvesterStatus.Docking;
            }
            if (!this.isValidTargetRefinery(this.target, r))
              return ((s.status = u.HarvesterStatus.MovingToRefinery), (this.forceTarget = void 0), this.onTick(r));
            if (s.status === u.HarvesterStatus.Docking) {
              if (270 !== r.direction) return (this.children.push(new c.TurnTask(270)), !1);
              (this.target.dockTrait.dockUnitAt(r, this.reservedDockNumber),
                (this.reservedDockNumber = void 0),
                (s.status = u.HarvesterStatus.PreparingToUnload));
            }
            if (s.status === u.HarvesterStatus.PreparingToUnload)
              return (
                (this.preventOpportunityFire = !0),
                this.children.push(new h.WaitMinutesTask(2 / 60)),
                (s.status = u.HarvesterStatus.Unloading),
                !1
              );
            if (s.status !== u.HarvesterStatus.Unloading) return !1;
            var e = s.getBails().reduce((e, [t, i]) => e + i * this.game.rules.getTiberium(t).value, 0),
              a = e,
              n = [...this.target.owner.buildings].filter(
                (e) => e.rules.orePurifier && (!e.poweredTrait || !this.target.owner.powerTrait?.isLowPower()),
              ).length,
              o = this.game.rules.general.purifierBonus;
            return (
              (a += n * Math.floor(e * o)),
              (this.target.owner.credits += a),
              (this.target.owner.creditsGained += a),
              s.empty(),
              1 === r.unitOrderTrait.getTasks().length && r.unitOrderTrait.addTask(new g.GatherOreTask(this.game)),
              !0
            );
          }
          isValidTargetRefinery(e, t) {
            return e.isSpawned && this.game.areFriendly(e, t) && !e.warpedOutTrait.isActive();
          }
          findClosestReachableRefinery(i) {
            let r = this.rangeHelper;
            var e = i.zone === o.ZoneType.Air,
              t = i.rules.speedType,
              s = i.isInfantry();
            let a =
                !e && this.game.map.terrain.getPassableSpeed(i.tile, t, s, i.onBridge)
                  ? this.game.map.terrain.getIslandIdMap(t, s)
                  : void 0,
              n = [...i.owner.buildings]
                .filter(
                  (e) =>
                    e.rules.refinery &&
                    e.dockTrait &&
                    !e.warpedOutTrait.isActive() &&
                    ((e) => i.rules.teleporter || a?.get(e, !1) === a?.get(i.tile, i.onBridge))(
                      this.findRefineryDockingTile(e),
                    ),
                )
                .sort((e, t) => r.distance2(i, e) - r.distance2(i, t));
            ((t = n[0]), (s = n.find((e) => 0 < e.dockTrait.getAvailableDockCount())));
            return !s ||
              (t &&
                r.tileDistance(i, s.centerTile) - r.tileDistance(i, t.centerTile) >
                  this.game.rules.general.harvesterTooFarDistance)
              ? t
              : s;
          }
          findReachableQueueingTile(t) {
            if (this.target.art.queueingCell) {
              var e = new a.Vector2(this.target.tile.rx, this.target.tile.ry).add(this.target.art.queueingCell),
                e = this.game.map.tiles.getByMapCoords(e.x, e.y);
              if (e && this.isValidQueueingTile(e, t)) return e;
            }
            return new r.RadialTileFinder(
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
            var i = t.zone === o.ZoneType.Air,
              r = t.rules.speedType,
              s = t.isInfantry();
            let a =
              !i && this.game.map.terrain.getPassableSpeed(t.tile, r, s, t.onBridge)
                ? this.game.map.terrain.getIslandIdMap(r, s)
                : void 0;
            return (
              i ||
              (a?.get(e, !1) === a?.get(t.tile, t.onBridge) &&
                Math.abs(e.z - this.target.tile.z) < 2 &&
                !e.onBridgeLandType)
            );
          }
          findRefineryDockingTile(e) {
            var t = {
              x: e.tile.rx + e.getFoundation().width - 1,
              y: e.tile.ry + Math.floor(e.getFoundation().height / 2),
            };
            return this.game.map.tiles.getByMapCoords(t.x, t.y);
          }
          chronoMinerCanTeleport(e, t, i) {
            let r = this.rangeHelper;
            var s = r.tileDistance(e, t);
            return (
              !(!this.forceTarget && s > this.game.rules.general.chronoHarvTooFarDistance) &&
              !(s <= 1) &&
              !!this.isValidTargetRefinery(i, e) &&
              !(0 === i.dockTrait.getAvailableDockCount() && !i.dockTrait.hasReservedDockForUnit(e))
            );
          }
        }),
          e("ReturnOreTask", n));
      },
    };
  },
);
