// === Reconstructed SystemJS module: game/gameobject/trait/FactoryTrait ===
// deps: ["game/gameobject/Building","game/gameobject/trait/interface/NotifyTick","game/player/production/ProductionQueue","game/rules/TechnoRules","game/gameobject/task/move/ExitFactoryTask","engine/type/TerrainType","game/gameobject/trait/interface/NotifySpawn","game/gameobject/trait/MoveTrait","game/map/tileFinder/CardinalTileFinder","game/gameobject/trait/DockTrait","game/event/FactoryProduceUnitEvent","game/gameobject/Infantry","game/map/TileOccupation","game/gameobject/task/move/MoveTask","game/map/tileFinder/RadialTileFinder","game/gameobject/trait/interface/NotifyWarpChange","game/gameobject/unit/VeteranLevel","game/trait/interface/NotifyProduceUnit","game/math/Vector2","game/gameobject/trait/interface/NotifyOwnerChange","game/gameobject/trait/interface/NotifyDestroy","game/gameobject/unit/ZoneType","game/gameobject/task/system/WaitMinutesTask","game/gameobject/task/system/CallbackTask","game/gameobject/task/system/TaskGroup","game/gameobject/common/DeathType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/trait/FactoryTrait",
  [
    "game/gameobject/Building",
    "game/gameobject/trait/interface/NotifyTick",
    "game/player/production/ProductionQueue",
    "game/rules/TechnoRules",
    "game/gameobject/task/move/ExitFactoryTask",
    "engine/type/TerrainType",
    "game/gameobject/trait/interface/NotifySpawn",
    "game/gameobject/trait/MoveTrait",
    "game/map/tileFinder/CardinalTileFinder",
    "game/gameobject/trait/DockTrait",
    "game/event/FactoryProduceUnitEvent",
    "game/gameobject/Infantry",
    "game/map/TileOccupation",
    "game/gameobject/task/move/MoveTask",
    "game/map/tileFinder/RadialTileFinder",
    "game/gameobject/trait/interface/NotifyWarpChange",
    "game/gameobject/unit/VeteranLevel",
    "game/trait/interface/NotifyProduceUnit",
    "game/math/Vector2",
    "game/gameobject/trait/interface/NotifyOwnerChange",
    "game/gameobject/trait/interface/NotifyDestroy",
    "game/gameobject/unit/ZoneType",
    "game/gameobject/task/system/WaitMinutesTask",
    "game/gameobject/task/system/CallbackTask",
    "game/gameobject/task/system/TaskGroup",
    "game/gameobject/common/DeathType",
  ],
  function (t, e) {
    "use strict";
    var c, i, n, h, u, r, s, d, a, o, g, p, m, f, l, y, T, v, b, S, w, E, C, x, O, A, M, R;
    e && e.id;
    return {
      setters: [
        function (e) {
          c = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          o = e;
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
          l = e;
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
          x = e;
        },
        function (e) {
          O = e;
        },
        function (e) {
          A = e;
        },
      ],
      execute: function () {
        var e;
        (((e = M || t("FactoryStatus", (M = {})))[(e.Idle = 0)] = "Idle"),
          (e[(e.Delivering = 1)] = "Delivering"),
          (R = class {
            constructor(e, t = !1) {
              ((this.type = e), (this.isCloningVats = t), (this.status = M.Idle));
            }
            [s.NotifySpawn.onSpawn](e, t) {
              this.resetRallyPoint(e, t);
            }
            resetRallyPoint(e, t) {
              var i;
              [h.FactoryType.BuildingType, h.FactoryType.AircraftType].includes(this.type) ||
                ((i = this.computeDefaultRallyPoint(e, this.type, t.map)), e.rallyTrait?.changeRallyPoint(i, e, t));
            }
            [y.NotifyWarpChange.onChange](t, e, i) {
              if (t.owner.production) {
                let e = [];
                e =
                  this.type === h.FactoryType.BuildingType
                    ? [n.QueueType.Structures, n.QueueType.Armory]
                    : [t.owner.production.getQueueTypeForFactory(this.type)];
                for (var r of e) t.owner.production.getQueue(r).notifyUpdated();
              }
            }
            [S.NotifyOwnerChange.onChange](e, t, i) {
              this.status === M.Delivering &&
                e.rules.deployTime &&
                this.deliveringUnit &&
                !this.deliveringUnit.isDestroyed &&
                this.unitIsInsideFactory(this.deliveringUnit, e, i) &&
                i.changeObjectOwner(this.deliveringUnit, e.owner);
            }
            [w.NotifyDestroy.onDestroy](e, t, i, r) {
              this.status === M.Delivering &&
                e.rules.deployTime &&
                this.deliveringUnit &&
                !this.deliveringUnit.isDestroyed &&
                e.deathType !== A.DeathType.Temporal &&
                this.unitIsInsideFactory(this.deliveringUnit, e, t) &&
                t.destroyObject(this.deliveringUnit, i, r);
            }
            [i.NotifyTick.onTick](i, r) {
              if (this.status === M.Delivering) {
                if (!this.deliveringUnit || this.deliveringUnit.isDestroyed) {
                  if (
                    ((this.buildingProductionTicks = this.buildingProductionTicks ?? 1),
                    0 < this.buildingProductionTicks--)
                  )
                    return;
                  this.buildingProductionTicks = void 0;
                } else if (!this.unitHasClearedFactory(this.deliveringUnit, i, r)) {
                  // OpenYRWeb: anti-stall safety. If a produced unit cannot clear the factory
                  // exit for an extended period (e.g. exit tile blocked by terrain/units), the
                  // factory would stay in Delivering forever and queue no more units. After a
                  // generous timeout (~10s = 150 ticks at BASE_TICKS_PER_SECOND=15), release the
                  // factory so production continues. The stuck unit keeps its ExitFactoryTask and
                  // may still move later; this only unblocks the factory slot.
                  if (((this.deliverStallTicks = (this.deliverStallTicks ?? 0) + 1) < 150))
                    return;
                  this.deliverStallTicks = void 0;
                }
                return ((this.status = M.Idle), (this.deliverStallTicks = void 0), void (this.deliveringUnit = void 0));
              }
              if (i.owner.production && !i.warpedOutTrait.isActive()) {
                let e = i.owner.production.getPrimaryFactory(this.type);
                if (
                  (e?.warpedOutTrait.isActive() ||
                    e === i ||
                    (e?.factoryTrait?.deliveringUnit && e.factoryTrait.type === h.FactoryType.UnitType)) &&
                  this.type !== h.FactoryType.BuildingType
                ) {
                  let e = i.owner.production.getQueueForFactory(this.type);
                  if (e && e.status === n.QueueStatus.Ready) {
                    let t = e.getFirst();
                    if (this.type === h.FactoryType.AircraftType) {
                      let e = this.produceAircraftAt(i, t, r);
                      var s;
                      if (!e)
                        for (s of [...i.owner.buildings].filter(
                          (e) => e.factoryTrait?.type === h.FactoryType.AircraftType && e.helipadTrait,
                        )) {
                          if (e) break;
                          e = this.produceAircraftAt(s, t, r);
                        }
                      if (!e) return;
                    } else {
                      var a;
                      if (
                        (this.produceGroundUnitAt(i, t, r),
                        !this.isCloningVats && this.type === h.FactoryType.InfantryType)
                      )
                        for (a of [...i.owner.buildings].filter((e) => e.factoryTrait && e.rules.cloning))
                          a.factoryTrait.status === M.Idle && a.factoryTrait.produceGroundUnitAt(a, t, r);
                    }
                    (i.owner.addUnitsBuilt(t.rules, 1),
                      (t.creditsSpent = 0),
                      (t.progress = 0),
                      e.shift(t.rules, 1),
                      e.currentSize && (e.status = n.QueueStatus.Active));
                  }
                }
              }
            }
            unitIsInsideFactory(e, t, i) {
              return i.map.tileOccupation.isTileOccupiedBy(e.tile, t) && e.zone !== E.ZoneType.Air;
            }
            unitHasClearedFactory(e, t, i) {
              return (
                !i.map.tileOccupation.isTileOccupiedBy(e.tile, t) ||
                (e.rules.consideredAircraft && e.position.tileElevation >= t.art.height)
              );
            }
            produceGroundUnitAt(t, e, i) {
              let r = i.createUnitForPlayer(e.rules, t.owner);
              (e.rules.trainable &&
                t.owner.canProduceVeteran(r.rules) &&
                r.veteranTrait?.setVeteranLevel(T.VeteranLevel.Veteran),
                r.isInfantry() && (r.position.subCell = p.Infantry.SUB_CELLS[0]));
              let s = this.computeInternalRallyPoint(t, this.type, t.rallyTrait.getRallyPoint(), i.map);
              this.type !== h.FactoryType.UnitType &&
                (s = t.rallyTrait.findRallyPointforUnit(r, s, i.map, !1, t.tile.z));
              let a;
              var n;
              ((a =
                this.type === h.FactoryType.NavalUnitType
                  ? s
                  : ((n = this.computeExitCoords(t, this.type)),
                    i.map.tiles.getByMapCoords(Math.floor(n.rx), Math.floor(n.ry)))),
                r.rules.consideredAircraft && (s = a));
              let o;
              if (
                (t.rallyTrait.getRallyPoint() !== s && (o = t.rallyTrait.findRallyNodeForUnit(r, i.map)),
                r.isInfantry())
              ) {
                let t = i.map.tileOccupation
                  .getObjectsOnTileByLayer(
                    o?.tile ?? s,
                    r.rules.consideredAircraft ? m.LayerType.Air : m.LayerType.Ground,
                  )
                  .filter((e) => e.isInfantry() && e.moveTrait.moveState !== d.MoveState.Moving)
                  .map((e) => e.position.subCell);
                r.position.subCell = p.Infantry.SUB_CELLS.find((e) => !t.includes(e)) ?? p.Infantry.SUB_CELLS[0];
              }
              function l() {
                var e;
                r.rules.consideredAircraft
                  ? ((e = o ?? { tile: s, onBridge: void 0 }),
                    r.unitOrderTrait.addTaskNext(
                      new f.MoveTask(i, e.tile, !!e.onBridge, { closeEnoughTiles: i.rules.general.closeEnough }),
                    ))
                  : r.unitOrderTrait.addTaskNext(new u.ExitFactoryTask(i, t, s, o));
              }
              ((r.direction = 270),
                i.spawnObject(r, a),
                i.traits.filter(v.NotifyProduceUnit).forEach((e) => {
                  e[v.NotifyProduceUnit.onProduce](r, i);
                }),
                i.events.dispatch(new g.FactoryProduceUnitEvent(r)),
                t.rules.deployTime
                  ? r.unitOrderTrait.addTask(
                      new O.TaskGroup(
                        new C.WaitMinutesTask(t.rules.deployTime),
                        new x.CallbackTask(() => {
                          t.isSpawned && t.buildStatus !== c.BuildStatus.BuildDown && l();
                        }),
                      ).setCancellable(!1),
                    )
                  : l(),
                (this.status = M.Delivering),
                (this.deliveringUnit = r));
            }
            produceAircraftAt(e, t, i) {
              let r = e.traits.find(o.DockTrait);
              if (!r) return !1;
              var s = r.getFirstAvailableDockNumber();
              if (void 0 === s) return !1;
              let a = i.createUnitForPlayer(t.rules, e.owner);
              t.rules.trainable &&
                e.owner.canProduceVeteran(a.rules) &&
                a.veteranTrait?.setVeteranLevel(T.VeteranLevel.Veteran);
              var n = r.getDockOffset(s);
              return (
                a.position.moveToLeptons(e.position.getMapPosition()),
                a.position.moveByLeptons3(n),
                i.spawnObject(a, a.position.tile),
                r.dockUnitAt(a, s),
                a.isAircraft() && a.airportBoundTrait && (a.airportBoundTrait.preferredAirport = e),
                i.traits.filter(v.NotifyProduceUnit).forEach((e) => {
                  e[v.NotifyProduceUnit.onProduce](a, i);
                }),
                i.events.dispatch(new g.FactoryProduceUnitEvent(a)),
                !0
              );
            }
            computeExitCoords(e, t) {
              if (t === h.FactoryType.InfantryType) return this.computeBarracksDefaultExitCoords(e);
              if (t === h.FactoryType.UnitType) return this.computeWarFactoryExitCoords(e);
              throw new Error("Unsupported factory type " + h.FactoryType[t]);
            }
            computeInternalRallyPoint(e, t, i, r) {
              let s, a;
              if (t === h.FactoryType.NavalUnitType) a = this.computeNavalInternalRallyPoint(e, i, r);
              else {
                if (t === h.FactoryType.InfantryType) s = this.computeBarracksInternalRallyCoords(e);
                else {
                  if (t !== h.FactoryType.UnitType) throw new Error("Unsupported factory type " + h.FactoryType[t]);
                  s = this.computeWarFactoryInternalRallyCoords(e);
                }
                a = r.tiles.getByMapCoords(s.rx, s.ry);
              }
              return a ?? this.findTileAdjacentToBuilding(e, r);
            }
            computeDefaultRallyPoint(e, t, i) {
              let r, s;
              if (t === h.FactoryType.NavalUnitType) s = this.computeNavalDefaultRallyPoint(e, i);
              else {
                if (t === h.FactoryType.InfantryType) r = this.computeBarracksInternalRallyCoords(e);
                else {
                  if (t !== h.FactoryType.UnitType) throw new Error("Unsupported factory type " + h.FactoryType[t]);
                  r = this.computeWarFactoryDefaultRallyCoords(e);
                }
                s = i.tiles.getByMapCoords(r.rx, r.ry);
              }
              return s ?? this.findTileAdjacentToBuilding(e, i);
            }
            findTileAdjacentToBuilding(e, t) {
              return new l.RadialTileFinder(
                t.tiles,
                t.mapBounds,
                e.tile,
                e.getFoundation(),
                1,
                1,
                () => !0,
              ).getNextTile();
            }
            computeBarracksDefaultExitCoords(e) {
              var t = e.getFoundation();
              let i, r;
              return (
                t.width <= 2 || t.height <= 2
                  ? ((i = t.width - 1),
                    (r = t.height - 1),
                    e.rules.gdiBarracks && 2 < t.width && (i = Math.floor(t.width / 2)))
                  : ((i = 0), (r = t.height - 1)),
                { rx: e.tile.rx + i, ry: e.tile.ry + r }
              );
            }
            computeBarracksInternalRallyCoords(e) {
              var t = e.getFoundation();
              let { rx: i, ry: r } = this.computeBarracksDefaultExitCoords(e);
              return (
                !(t.width <= 2 || t.height <= 2) || e.rules.gdiBarracks
                  ? (r += 1)
                  : e.rules.nodBarracks && ((i += t.width <= 2 ? 1 : 0), (r += t.height <= 2 ? 1 : 0)),
                { rx: i, ry: r }
              );
            }
            computeWarFactoryExitCoords(e) {
              // OpenYRWeb: spawn the produced vehicle at the geometric center of the
              // factory foundation (matching original YR behavior). ExitFactoryTask
              // then drives the unit to the external rally point, ignoring the factory
              // building as a blocker (ignoredBlockers).
              var t = e.getFoundation();
              return { rx: e.tile.rx + Math.floor(t.width / 2), ry: e.tile.ry + Math.floor(t.height / 2) };
            }
            computeWarFactoryInternalRallyCoords(e) {
              var t = e.getFoundation();
              // OpenYRWeb: the internal rally point must be OUTSIDE the building foundation so
              // the produced vehicle can actually stop there (ExitFactoryTask.canStopAtTile blocks
              // factory tiles). The original used rx+width-1 (right edge), but for wide foundations
              // (e.g. YAWEAP is 5x3) that tile is still inside the foundation. Using rx+width
              // (the tile just past the right edge, same as the default rally point) guarantees
              // the target is outside and stoppable.
              return { rx: e.tile.rx + t.width, ry: e.tile.ry + Math.floor(t.height / 2) };
            }
            computeWarFactoryDefaultRallyCoords(e) {
              var t = e.getFoundation();
              return { rx: e.tile.rx + t.width, ry: e.tile.ry + Math.floor(t.height / 2) };
            }
            computeNavalDefaultRallyPoint(e, t) {
              let i = new a.CardinalTileFinder(
                t.tiles,
                t.mapBounds,
                e.centerTile,
                5,
                5,
                (e) =>
                  e.terrainType === r.TerrainType.Water &&
                  !t.getObjectsOnTile(e).find((e) => e.isBuilding() || (e.isOverlay() && e.isBridge())),
              );
              return (
                (i.diagonal = !1),
                i.getNextTile() ??
                  t.tiles.getByMapCoords(e.tile.rx + e.getFoundation().width, e.tile.ry + e.getFoundation().height)
              );
            }
            computeNavalInternalRallyPoint(e, t, i) {
              var r = new b.Vector2(t.rx, t.ry).sub(new b.Vector2(e.centerTile.rx, e.centerTile.ry));
              return i.tiles.getByMapCoords(
                e.centerTile.rx + Math.sign(r.x) * (Math.floor(e.getFoundation().width / 2) + 1),
                e.centerTile.ry + Math.sign(r.y) * (Math.floor(e.getFoundation().height / 2) + 1),
              );
            }
          }),
          t("FactoryTrait", R));
      },
    };
  },
);
