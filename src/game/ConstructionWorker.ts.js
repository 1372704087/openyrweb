// === Reconstructed SystemJS module: game/ConstructionWorker ===
// deps: ["util/geometry","engine/type/ObjectType","game/type/SpeedType","game/gameobject/task/morph/PackBuildingTask","game/gameobject/task/system/CallbackTask","game/gameobject/task/system/TaskGroup","util/disposable/CompositeDisposable","game/event/EventType","game/gameobject/trait/interface/NotifyTick"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/ConstructionWorker",
  [
    "util/geometry",
    "engine/type/ObjectType",
    "game/type/SpeedType",
    "game/gameobject/task/morph/PackBuildingTask",
    "game/gameobject/task/system/CallbackTask",
    "game/gameobject/task/system/TaskGroup",
    "util/disposable/CompositeDisposable",
    "game/event/EventType",
    "game/gameobject/trait/interface/NotifyTick",
  ],
  function (e, t) {
    "use strict";
    var s, m, r, i, a, n, o, l, c, h;
    t && t.id;
    return {
      setters: [
        function (e) {
          s = e;
        },
        function (e) {
          m = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          i = e;
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
      ],
      execute: function () {
        e(
          "ConstructionWorker",
          (h = class {
            constructor(e, t, i, r, s) {
              ((this.player = e),
                (this.rules = t),
                (this.art = i),
                (this.map = r),
                (this.game = s),
                (this.adjacencyMaps = new Map()),
                (this.disposables = new o.CompositeDisposable()));
              let a = ({ object: e }) => {
                e.isBuilding() && this.adjacencyMaps.clear();
              };
              (this.map.tileOccupation.onChange.subscribe(a),
                this.disposables.add(() => this.map.tileOccupation.onChange.unsubscribe(a)),
                this.disposables.add(
                  this.game.events.subscribe(l.EventType.AllianceChange, () => this.adjacencyMaps.clear()),
                  this.game.events.subscribe(l.EventType.ObjectOwnerChange, (e) => {
                    e.target.isBuilding() && this.adjacencyMaps.clear();
                  }),
                  this.game.events.subscribe(l.EventType.ObjectDestroy, (e) => {
                    e.target.isBuilding() && e.target.rules.leaveRubble && this.adjacencyMaps.clear();
                  }),
                ));
            }
            getAdjacentRect(e, t, i) {
              return { x: e.rx - i, y: e.ry - i, width: t.width + 2 * i, height: t.height + 2 * i };
            }
            getAdjacencyMap(e) {
              var t;
              let i = [];
              for (t of [
                ...this.player.buildings,
                ...(this.game.gameOpts.buildOffAlly
                  ? this.game.alliances
                      .getAllies(this.player)
                      .map((e) => [...e.buildings].filter((e) => e.rules.eligibileForAllyBuilding))
                      .flat()
                  : []),
              ])
                t.rules.baseNormal && i.push(this.getAdjacentRect(t.tile, t.art.foundation, e));
              return i;
            }
            meetsAdjacency(e, t) {
              let i = this.adjacencyMaps.get(t);
              i || ((i = this.getAdjacencyMap(t)), this.adjacencyMaps.set(t, i));
              for (var r of i) if (s.rectIntersect(e, r)) return !0;
              return !1;
            }
            getPlacementPreview(e, t, i = {}) {
              var { normalizedTile: r = !1, ignoreObjects: s, ignoreAdjacent: a = !1 } = i,
                n = this.rules.getBuilding(e),
                o = this.art.getObject(e, m.ObjectType.Building);
              let l = [];
              var c = o.foundation,
                h = r ? t : this.normalizePlacementTileCoords(o, t);
              let u = !0;
              o = { x: h.rx, y: h.ry, width: c.width, height: c.height };
              a || this.meetsAdjacency(o, n.adjacent) || (u = !1);
              for (let p = 0; p < c.width; p++)
                for (let e = 0; e < c.height; e++) {
                  var d = { x: h.rx + p, y: h.ry + e },
                    g = this.map.tiles.getByMapCoords(d.x, d.y);
                  g && l.push({ rx: d.x, ry: d.y, buildable: u && this.isTileBuildable(g, n, s) });
                }
              if (n.wall && l[0].buildable) {
                let e = this.getWallConnectingTiles(h, n);
                e.forEach((e) => {
                  l.push({ rx: e.rx, ry: e.ry, buildable: !0 });
                });
              }
              return l;
            }
            canPlaceAt(e, t, i = {}) {
              var { normalizedTile: r = !1, ignoreObjects: s, ignoreAdjacent: a = !1 } = i,
                n = this.rules.getBuilding(e),
                o = this.art.getObject(e, m.ObjectType.Building),
                l = o.foundation,
                c = r ? t : this.normalizePlacementTileCoords(o, t),
                o = { x: c.rx, y: c.ry, width: l.width, height: l.height };
              if (!a && !this.meetsAdjacency(o, n.adjacent)) return !1;
              for (let u = 0; u < l.width; u++)
                for (let e = 0; e < l.height; e++) {
                  var h = { x: c.rx + u, y: c.ry + e },
                    h = this.map.tiles.getByMapCoords(h.x, h.y);
                  if (!h || !this.isTileBuildable(h, n, s)) return !1;
                }
              return !0;
            }
            placeAt(e, t, i = !1) {
              let r = [],
                s = this.rules.getBuilding(e),
                a = i ? t : this.normalizePlacementTile(e, t);
              if (s.wall) {
                let t = [[a, s]],
                  e = this.getWallConnectingTiles(a, s);
                e.forEach((e) => {
                  e !== a && t.push([e, s]);
                });
                for (var n of t) r.push(this.executePlacement(n[0], n[1]));
              } else {
                var o,
                  l = this.executePlacement(a, s);
                r.push(l);
                for (o of this.map.tileOccupation.calculateTilesForGameObject(a, l)) {
                  var c = this.map.getObjectsOnTile(o).find((e) => e.isSmudge());
                  c && this.game.unspawnObject(c);
                }
              }
              return r;
            }
            normalizePlacementTileCoords(e, t) {
              var i = e.foundationCenter;
              return { rx: t.rx - i.x, ry: t.ry - i.y };
            }
            normalizePlacementTile(e, t) {
              var i = this.art.getObject(e, m.ObjectType.Building),
                r = this.normalizePlacementTileCoords(i, t),
                i = this.map.tiles.getByMapCoords(r.rx, r.ry);
              if (!i) throw new Error(`Can't build outside map (${r.rx}, ${r.ry})`);
              return i;
            }
            unplace(e, t) {
              (e.unitOrderTrait.cancelAllTasks(),
                e.unitOrderTrait.addTasks(
                  new n.TaskGroup(
                    new i.PackBuildingTask(this.game),
                    new a.CallbackTask(() => {
                      (this.game.unspawnObject(e), t());
                    }),
                  ).setCancellable(!1),
                ),
                e.unitOrderTrait[c.NotifyTick.onTick](e, this.game));
            }
            executePlacement(e, t) {
              let i = this.game.createObject(m.ObjectType.Building, t.name);
              return (
                this.game.changeObjectOwner(i, this.player),
                (i.purchaseValue = this.game.sellTrait.computePurchaseValue(t, this.player)),
                this.game.spawnObject(i, e),
                i
              );
            }
            getWallConnectingTiles(i, r) {
              var s,
                a = r.guardRange + 1;
              let n = [];
              for (s of [
                [0, 1],
                [0, -1],
                [1, 0],
                [-1, 0],
              ]) {
                let e = [];
                for (let t = 0; t < a; ++t) {
                  var o = { x: i.rx + s[0] * t, y: i.ry + s[1] * t },
                    o = this.map.tiles.getByMapCoords(o.x, o.y);
                  if (!o) break;
                  if (
                    this.map
                      .getObjectsOnTile(o)
                      .find((e) => e.isBuilding() && e.name === r.name && e.owner === this.player)
                  ) {
                    n = n.concat(e);
                    break;
                  }
                  if (!this.isTileBuildable(o, r)) break;
                  e.push(o);
                }
              }
              return n;
            }
            isTileBuildable(e, t, i) {
              return (
                !!this.map.isWithinBounds(e) &&
                !this.game.mapShroudTrait.getPlayerShroud(this.player)?.isShrouded(e) &&
                !this.map
                  .getGroundObjectsOnTile(e)
                  .some((e) => !(i?.includes(e) || (e.isBuilding() && e.rules.invisibleInGame) || e.isSmudge())) &&
                (t.waterBound
                  ? 0 < this.rules.getLandRules(e.landType).getSpeedModifier(r.SpeedType.Float)
                  : 0 === e.rampType && this.rules.getLandRules(e.landType).buildable)
              );
            }
            dispose() {
              this.disposables.dispose();
            }
          }),
        );
      },
    };
  },
);
