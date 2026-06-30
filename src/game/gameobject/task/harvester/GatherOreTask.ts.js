// === Reconstructed SystemJS module: game/gameobject/task/harvester/GatherOreTask ===
// deps: ["game/gameobject/task/system/Task","game/map/tileFinder/RadialTileFinder","game/gameobject/trait/HarvesterTrait","game/type/LandType","game/gameobject/task/move/MoveTask","game/gameobject/trait/TiberiumTrait","game/gameobject/task/system/WaitMinutesTask","game/gameobject/task/harvester/ReturnOreTask","game/gameobject/unit/RangeHelper","game/gameobject/task/system/CallbackTask","game/gameobject/trait/MoveTrait","game/type/MovementZone"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/task/harvester/GatherOreTask",
  [
    "game/gameobject/task/system/Task",
    "game/map/tileFinder/RadialTileFinder",
    "game/gameobject/trait/HarvesterTrait",
    "game/type/LandType",
    "game/gameobject/task/move/MoveTask",
    "game/gameobject/trait/TiberiumTrait",
    "game/gameobject/task/system/WaitMinutesTask",
    "game/gameobject/task/harvester/ReturnOreTask",
    "game/gameobject/unit/RangeHelper",
    "game/gameobject/task/system/CallbackTask",
    "game/gameobject/trait/MoveTrait",
    "game/type/MovementZone",
  ],
  function (e, t) {
    "use strict";
    var i, d, a, g, n, p, o, r, s, l, c, m, f, h;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          p = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          m = e;
        },
      ],
      execute: function () {
        ((f = [
          [8, 5, 6],
          [3, 0, 2],
          [7, 4, 1],
        ]),
          (h = class extends i.Task {
            constructor(e, t, i = !1) {
              (super(),
                (this.game = e),
                (this.initialTarget = t),
                (this.explicitOrder = i),
                (this.forceMoveTried = !1),
                (this.useChildTargetLines = !0),
                (this.preventOpportunityFire = !1),
                (this.rangeHelper = new s.RangeHelper(e.map.tileOccupation)),
                (this.scanNearRadius = e.rules.ai.tiberiumNearScan),
                (this.scanFarRadius = e.rules.ai.tiberiumFarScan));
            }
            onStart(e) {
              if (!e.isVehicle() || !e.harvesterTrait) throw new Error(`Unit ${e.name} is not a harvester.`);
              ((e.harvesterTrait.status = a.HarvesterStatus.MovingToOreSite),
                (e.harvesterTrait.lastGatherExplicit = this.explicitOrder));
            }
            onEnd(e) {
              e.harvesterTrait.status !== a.HarvesterStatus.LookingForOreSite &&
                (e.harvesterTrait.status = a.HarvesterStatus.Idle);
            }
            onTick(i) {
              if (this.isCancelling()) return !0;
              let r = i.harvesterTrait;
              if (r.status === a.HarvesterStatus.MovingToOreSite) {
                var e = this.target;
                if (
                  ((this.target = this.findClosestReachableOreSite(
                    i,
                    this.target || this.initialTarget?.landType !== g.LandType.Tiberium
                      ? (r.lastOreSite ?? i.tile)
                      : this.initialTarget,
                    !0,
                  )),
                  (r.lastOreSite = this.target),
                  !this.target)
                ) {
                  r.status = a.HarvesterStatus.LookingForOreSite;
                  let e = this.getRefineryOnTile(i.tile);
                  if (e && 1 === i.unitOrderTrait.getTasks().length) {
                    let t = i.rules.movementZone === m.MovementZone.Fly;
                    var s = new d.RadialTileFinder(
                      this.game.map.tiles,
                      this.game.map.mapBounds,
                      e.tile,
                      e.getFoundation(),
                      1,
                      5,
                      (e) =>
                        t ||
                        (0 < this.game.map.terrain.getPassableSpeed(e, i.rules.speedType, i.isInfantry(), !1) &&
                          Math.abs(e.z - i.tile.z) < 2 &&
                          !this.game.map.terrain.findObstacles({ tile: e, onBridge: void 0 }, i).length),
                    ).getNextTile();
                    s &&
                      i.unitOrderTrait.addTasks(
                        new n.MoveTask(this.game, s, !1),
                        new l.CallbackTask(() => {
                          [c.MoveResult.Success, c.MoveResult.CloseEnough, c.MoveResult.Cancel].includes(
                            i.moveTrait.lastMoveResult,
                          ) || this.children.push(new o.WaitMinutesTask(1 / 60));
                        }),
                      );
                  }
                  return !0;
                }
                ((s = this.game.rules.general.closeEnough),
                  (e = e && this.rangeHelper.tileDistance(i.tile, this.target) <= s));
                if (!(i.tile === this.target || (i.tile.landType === g.LandType.Tiberium && e))) {
                  if (i.tile !== this.target && e && i.tile.landType !== g.LandType.Tiberium) {
                    e = this.findClosestReachableOreSite(i, i.tile, !1, !0);
                    if (e) ((this.target = e), (r.lastOreSite = this.target));
                    else {
                      if (!this.forceMoveTried)
                        return (
                          (this.forceMoveTried = !0),
                          this.children.push(
                            new n.MoveTask(this.game, this.target, !1, { closeEnoughTiles: 0, strictCloseEnough: !0 }),
                          ),
                          !1
                        );
                      if (((this.forceMoveTried = !1), !r.isEmpty())) return (this.returnOreIfPossible(i), !0);
                      e = this.findClosestReachableOreSite(i, i.tile, !0, !0);
                      if (!e) return ((r.status = a.HarvesterStatus.LookingForOreSite), !0);
                      ((this.target = e), (r.lastOreSite = this.target));
                    }
                  }
                  return (
                    this.children.push(
                      new n.MoveTask(this.game, this.target, !1, { closeEnoughTiles: s }),
                      new l.CallbackTask(() => {
                        [c.MoveResult.Success, c.MoveResult.CloseEnough, c.MoveResult.Cancel].includes(
                          i.moveTrait.lastMoveResult,
                        ) || this.children.push(new o.WaitMinutesTask(5 / 60));
                      }),
                    ),
                    !1
                  );
                }
                ((this.target = i.tile),
                  (r.lastOreSite = this.target),
                  (r.status = a.HarvesterStatus.Harvesting),
                  (this.forceMoveTried = !1));
              }
              if (r.status !== a.HarvesterStatus.Harvesting) return !1;
              {
                if (r.isFull()) return (this.returnOreIfPossible(i), !0);
                let e = this.game.map.getObjectsOnTile(i.tile).find((e) => e.isOverlay() && e.isTiberium());
                if (!e)
                  return this.findClosestReachableOreSite(i, i.tile, !1) || r.isEmpty()
                    ? ((r.status = a.HarvesterStatus.MovingToOreSite), this.onTick(i))
                    : (this.returnOreIfPossible(i), !0);
                let t = e.traits.get(p.TiberiumTrait);
                s = t.collectBail();
                return (t.getBailCount() || this.game.unspawnObject(e),
                void 0 === s || r.addBails(s, 1),
                [...i.owner.buildings].some((e) => e.rules.refinery) || this.explicitOrder)
                  ? (this.children.push(new o.WaitMinutesTask(1 / 60)), !1)
                  : !0;
              }
            }
            findClosestReachableOreSite(t, i, e, r = !1) {
              let s = t.rules.movementZone === m.MovementZone.Fly;
              var a = t.rules.speedType,
                n = t.isInfantry();
              let o =
                  !s && this.game.map.terrain.getPassableSpeed(t.tile, a, n, t.onBridge)
                    ? this.game.map.terrain.getIslandIdMap(a, n)
                    : void 0,
                l = o?.get(t.tile, t.onBridge);
              var c,
                a = (e) =>
                  e.landType === g.LandType.Tiberium &&
                  o?.get(e, !1) === l &&
                  (!r || s || !this.game.map.terrain.findObstacles({ tile: e, onBridge: void 0 }, t).length);
              if (a(i)) return i;
              let h = 1;
              if (!e) {
                let e = new d.RadialTileFinder(
                    this.game.map.tiles,
                    this.game.map.mapBounds,
                    i,
                    { width: 1, height: 1 },
                    h,
                    h,
                    a,
                  ),
                  t = [];
                for (; (c = e.getNextTile());) t.push(c);
                if (t.length) {
                  let e = t.map((e) => {
                    let t = this.game.map.getObjectsOnTile(e).find((e) => e.isOverlay() && e.isTiberium());
                    if (!t) throw new Error(`Ore should exist on tile ${e.rx},${e.ry} b/c of landType`);
                    var i = t.traits.get(p.TiberiumTrait);
                    return { tile: e, ore: t, tibTrait: i };
                  });
                  return (
                    e.sort(
                      (e, t) =>
                        1e5 * (t.tibTrait.rules.value - e.tibTrait.rules.value) +
                        1e3 * (t.ore.value - e.ore.value) +
                        (f[1 + t.tile.ry - i.ry][1 + t.tile.rx - i.rx] - f[1 + e.tile.ry - i.ry][1 + e.tile.rx - i.rx]),
                    ),
                    e[0].tile
                  );
                }
                h = 2;
              }
              n = e ? this.scanFarRadius : this.scanNearRadius;
              let u = new d.RadialTileFinder(
                this.game.map.tiles,
                this.game.map.mapBounds,
                i,
                { width: 1, height: 1 },
                h,
                n,
                a,
              );
              return u.getNextTile();
            }
            getRefineryOnTile(e) {
              return this.game.map.getObjectsOnTile(e).find((e) => e.isBuilding() && e.rules.refinery);
            }
            returnOreIfPossible(e) {
              1 === e.unitOrderTrait.getTasks().length && e.unitOrderTrait.addTask(new r.ReturnOreTask(this.game));
            }
            getTargetLinesConfig(e) {
              return { pathNodes: this.initialTarget ? [{ tile: this.initialTarget, onBridge: void 0 }] : [] };
            }
          }),
          e("GatherOreTask", h));
      },
    };
  },
);
