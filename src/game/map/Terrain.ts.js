// === Reconstructed SystemJS module: game/map/Terrain ===
// deps: ["game/map/TileCollection","game/type/SpeedType","util/Graph","game/map/pathFinder/PathFinder","util/typeGuard","game/map/tileFinder/RadialTileFinder","util/geometry","game/type/LandType","game/rules/TerrainRules"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/map/Terrain",
  [
    "game/map/TileCollection",
    "game/type/SpeedType",
    "util/Graph",
    "game/map/pathFinder/PathFinder",
    "util/typeGuard",
    "game/map/tileFinder/RadialTileFinder",
    "util/geometry",
    "game/type/LandType",
    "game/rules/TerrainRules",
  ],
  function (e, t) {
    "use strict";
    var u, d, a, S, c, w, n, g, o, i;
    t && t.id;
    function E(e, t) {
      var i = Math.abs(e.data.tile.rx - t.data.tile.rx),
        r = Math.abs(e.data.tile.ry - t.data.tile.ry);
      return i + r + (Math.SQRT2 - 2) * Math.min(i, r);
    }
    function C(e, t, i) {
      var r = Math.abs(e.data.tile.rx - t.data.tile.rx),
        s = Math.abs(e.data.tile.ry - t.data.tile.ry);
      let a = r + s + (Math.SQRT2 - 2) * Math.min(r, s);
      return (
        i?.parent &&
          ((s = (r = i.parent.node).data.tile.rx - e.data.tile.rx),
          (r = r.data.tile.ry - e.data.tile.ry),
          (i.dirX = s),
          (i.dirY = r),
          (s === i.parent.dirX && r === i.parent.dirY) || (a += 0.2)),
        a
      );
    }
    return {
      setters: [
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          a = e;
        },
        function (e) {
          S = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          w = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          o = e;
        },
      ],
      execute: function () {
        e(
          "Terrain",
          (i = class {
            constructor(e, t, i, r, s) {
              ((this.tiles = e),
                (this.theaterType = t),
                (this.mapBounds = i),
                (this.tileOccupation = r),
                (this.rules = s),
                (this.passabilityGraphs = new Map()),
                (this.invalidatedTiles = new Map()),
                (this.tiberiumMayChangePassability = new Set()),
                (this.handleTileOccupationUpdate = ({ tiles: e, object: r }) => {
                  var t = e.filter((e) => {
                    if (r.isOverlay()) {
                      if (r.isBridge()) return !0;
                      if (r.isTiberium()) {
                        var t = g.getLandType(e.terrainType);
                        if (this.tiberiumMayChangePassability.has(t)) return !0;
                      }
                    }
                    var i = d.SpeedType.Foot,
                      t = !r.isTerrain();
                    return this.isBlockerObject(r, e, !1, i, t) || (r.isBuilding() && r.rules.leaveRubble);
                  });
                  t.length && this.invalidateTiles(t);
                }),
                (this.handleMapBoundsResize = () => {
                  this.passabilityGraphs.clear();
                }),
                r.onChange.subscribe(this.handleTileOccupationUpdate),
                i.onLocalResize.subscribe(this.handleMapBoundsResize),
                this.tiberiumMayChangePassability.clear());
              let a = this.rules.getLandRules(g.LandType.Tiberium);
              for (var n of Object.values(d.SpeedType).filter((e) => "string" != typeof e)) {
                var o,
                  l = Boolean(Math.sign(a.getSpeedModifier(n)));
                for (o of Object.values(g.LandType).filter((e) => "string" != typeof e))
                  Boolean(Math.sign(this.rules.getLandRules(o).getSpeedModifier(n))) !== l &&
                    this.tiberiumMayChangePassability.add(o);
              }
            }
            getGraphKey(e, t) {
              return e + "_" + Number(t);
            }
            invalidateTiles(i) {
              i.length &&
                [...this.passabilityGraphs.keys()].forEach((e) => {
                  let t = this.invalidatedTiles.get(e);
                  t ? i.forEach((e) => t.add(e)) : this.invalidatedTiles.set(e, new Set(i));
                });
            }
            computePath(
              s,
              a,
              e,
              t,
              i,
              r,
              {
                maxExpandedNodes: n = Number.POSITIVE_INFINITY,
                bestEffort: o = !0,
                excludeTiles: l,
                ignoredBlockers: c = [],
              } = {},
            ) {
              let h = this.computePassabilityGraph(s, a);
              var u = c
                .map((e) => this.tileOccupation.calculateTilesForGameObject(e.tile, e))
                .reduce((e, t) => e.concat(t), []);
              u.length && this.updatePassability(u, s, a, h, c);
              var d = this.getNodeId(e, t),
                g = !!h.hasNode(d);
              g || this.updatePassability([e], s, a, h, c, 1);
              var p = this.getNodeId(i, r),
                m = !!h.hasNode(p);
              let f;
              var y = g && !u.length;
              if (y) {
                let i = this.getIslandIdMap(s, a),
                  r = i.get(e, t);
                f = (e, t) => i.get(e, t) === r;
              } else f = (e, t) => 0 < this.getPassableSpeed(e, s, a, t, c);
              if (!m || !f(i, r)) {
                var T = o
                  ? new w.RadialTileFinder(
                      this.tiles,
                      this.mapBounds,
                      i,
                      { width: 1, height: 1 },
                      1,
                      y ? 15 : 5,
                      (e) => f(e, !1) && Math.abs(e.z - i.z) < 2 && !l?.({ tile: e, onBridge: void 0 }),
                    ).getNextTile()
                  : void 0;
                if (T) ((i = T), (r = !1));
                else {
                  if (y) return (u.length && this.updatePassability(u, s, a, h), []);
                  (h.addNode(p, { tile: i, onBridge: void 0 }), (n = Math.min(n, 500)));
                }
              }
              let v = S.PathFinder(h, {
                  bestEffort: o,
                  maxExpandedNodes: n,
                  excludedNodes: l,
                  distance: E,
                  heuristic: C,
                }),
                b = v
                  .find(this.getNodeId(e, t), this.getNodeId(i, r))
                  .map((e) => ({ tile: e.data.tile, onBridge: e.data.onBridge }));
              return (
                (b.length < 2 || (l && b.length && ((!o && b[0].tile !== i) || b[b.length - 1].tile !== e))) &&
                  (b = []),
                g || (h.removeNode(d), this.updatePassability([e], s, a, h)),
                m || h.removeNode(p),
                u.length && this.updatePassability(u, s, a, h),
                b
              );
            }
            computeAllPassabilityGraphs() {
              Object.keys(d.SpeedType).forEach((e) => {
                var t = Number(e);
                isNaN(t) ||
                  t === d.SpeedType.Winged ||
                  (this.computePassabilityGraph(t, !1), this.computePassabilityGraph(t, !0));
              });
            }
            computePassabilityGraph(t, i) {
              var r = this.getGraphKey(t, i);
              let s = this.passabilityGraphs.get(r);
              if (s) {
                let e = this.invalidatedTiles.get(r);
                e?.size && (this.updatePassability([...e], t, i, s), e.clear(), this.computeIslandIds(s));
              } else
                ((s = new a.Graph()),
                  this.passabilityGraphs.set(r, s),
                  this.tiles.forEach((e) => {
                    this.computePassability(e, t, i, s);
                  }),
                  this.computeIslandIds(s));
              return s;
            }
            updatePassability(t, i, r, s, a = [], n) {
              let o = new Set();
              t.forEach((e) => {
                [
                  e,
                  this.tiles.getNeighbourTile(e, u.TileDirection.Right),
                  this.tiles.getNeighbourTile(e, u.TileDirection.BottomRight),
                  this.tiles.getNeighbourTile(e, u.TileDirection.Bottom),
                  this.tiles.getNeighbourTile(e, u.TileDirection.BottomLeft),
                ]
                  .filter(c.isNotNullOrUndefined)
                  .forEach((e) => o.add(e));
              });
              let l = new Map();
              (t.forEach((e) => {
                var t;
                for (t of [s.getNode(this.getNodeId(e, !1)), s.getNode(this.getNodeId(e, !0))])
                  t && (l.set(t.id, t.data.islandId), s.removeNode(t.id));
              }),
                o.forEach((e) => {
                  this.computePassability(e, i, r, s, a, n && t.includes(e) ? n : void 0);
                }),
                l.forEach((e, t) => {
                  let i = s.getNode(t);
                  i && (i.data.islandId = e);
                }));
            }
            computePassability(e, t, i, r, s = [], a) {
              var n = [u.TileDirection.Left, u.TileDirection.TopLeft, u.TileDirection.Top, u.TileDirection.TopRight];
              if (a || this.getPassableSpeed(e, t, i, !1, s)) {
                var o,
                  l = this.getNodeId(e, !1);
                r.hasNode(l) || r.addNode(l, { tile: e, onBridge: void 0, forceLandSpeed: a });
                for (o of n) this.connectTiles(e, void 0, o, t, i, r, s);
              }
              var c = this.tileOccupation.getBridgeOnTile(e);
              if (c && (a || this.getPassableSpeed(e, t, i, !0, s))) {
                var h,
                  l = this.getNodeId(e, !0);
                r.hasNode(l) || r.addNode(l, { tile: e, onBridge: c, forceLandSpeed: a });
                for (h of n) this.connectTiles(e, c, h, t, i, r, s);
              }
            }
            connectTiles(i, r, e, s, a, n, o = []) {
              var l = this.tiles.getNeighbourTile(i, e);
              if (l) {
                let e = this.tileOccupation.getBridgeOnTile(l);
                var c = r || e ? 0 : 1;
                if (Math.abs(i.z + (r?.tileElevation ?? 0) - (l.z + (e?.tileElevation ?? 0))) > c) {
                  if (
                    (!e?.isHighBridge() && !r?.isHighBridge()) ||
                    0 !== Math.abs(i.z - l.z) ||
                    !n.hasNode(this.getNodeId(i, !1))
                  )
                    return;
                  r = e = void 0;
                }
                c = this.getNodeId(l, !!e);
                let t = n.getNode(c);
                this.getPassableSpeed(l, s, a, !!e, o, void 0, t?.data.forceLandSpeed) &&
                  ((t = t ?? n.addNode(c, { tile: l, onBridge: e })),
                  (l = this.getNodeId(i, !!r)),
                  n.getNode(l).addLink(t));
              }
            }
            getNodeId(e, t) {
              return e.id + (t ? "_bridge" : "");
            }
            computeIslandIds(e) {
              let t = 1;
              (e.forEachNode((e) => {
                e.data.islandId = void 0;
              }),
                e.forEachNode((e) => {
                  e.data.islandId || this.floodIslandId(e, t++);
                }));
            }
            floodIslandId(e, t) {
              let i = [e];
              for (; i.length;) {
                let e = i.pop();
                e.data.islandId = t;
                for (var r of e.neighbors) r.data.islandId || i.push(r);
              }
            }
            getIslandIdMap(e, t) {
              let r = this.computePassabilityGraph(e, t);
              return {
                get: (e, t) => {
                  var i = this.getNodeId(e, t);
                  return r.getNode(i)?.data.islandId;
                },
              };
            }
            getPassableSpeed(e, t, i, r, s = [], a = !1, n) {
              if (!this.mapBounds.isWithinBounds(e)) return 0;
              let o = r ? e.onBridgeLandType : e.landType;
              if (void 0 === o) return 0;
              o === g.LandType.Wall && t === d.SpeedType.Track && (o = g.getLandType(e.terrainType));
              let l = this.rules.getLandRules(o);
              var c,
                h = n || l.getSpeedModifier(t);
              if (!h) return 0;
              if (!a)
                for (c of this.tileOccupation.getObjectsOnTile(e))
                  if (this.isBlockerObject(c, e, r, t, i) && !s.includes(c)) return 0;
              return h;
            }
            isBlockerObject(t, i, e, r, s) {
              if (t.rules.crushable && [d.SpeedType.Track, d.SpeedType.Hover].includes(r)) return !1;
              if (t.isTerrain()) return !s || t.rules.getOccupationBits(this.theaterType) === o.OccupationBits.All;
              if (t.isBuilding()) {
                if (t.rules.invisibleInGame) return !1;
                if (t.isDestroyed && t.rules.leaveRubble) return !1;
                if (t.rules.gate) return !1;
                var a = t.art.foundation;
                let e = t.rules.numberImpassableRows;
                s ? (e = a.width) : t.rules.weaponsFactory && !e && (e = a.width - 1);
                a = { x: t.tile.rx, y: t.tile.ry, width: (e || a.width) - 1, height: a.height - 1 };
                return n.rectContainsPoint(a, { x: i.rx, y: i.ry });
              }
              return !(
                t.isAircraft() ||
                t.isInfantry() ||
                t.isVehicle() ||
                t.isSmudge() ||
                (t.isOverlay() &&
                  ((e && t.isBridge()) ||
                    (!e && t.isHighBridge()) ||
                    t.isTiberium() ||
                    t.rules.crate ||
                    t.isBridgePlaceholder()))
              );
            }
            findObstacles(t, e) {
              var i,
                r,
                s = e.rules.speedType,
                a = e.isInfantry();
              let n = [];
              for (i of this.tileOccupation.getGroundObjectsOnTile(t.tile))
                i !== e &&
                  ((r = this.isBlockerObject(i, t.tile, !!t.onBridge, s, a)) ||
                    (i.isUnit() &&
                      ((i.tile === t.tile && i.onBridge === !!t.onBridge) ||
                        i.moveTrait.reservedPathNodes.find(
                          (e) => e.tile === t.tile && !!e.onBridge == !!t.onBridge,
                        ))) ||
                    ([d.SpeedType.Track, d.SpeedType.Hover].includes(s) && i.rules.crushable) ||
                    (a && i.isTerrain()) ||
                    (i.isBuilding() && i.rules.gate)) &&
                  ((r = { obj: i, static: r }),
                  i.isInfantry() && a
                    ? i.position.desiredSubCell === e.position.desiredSubCell && n.push(r)
                    : (i.isTerrain() &&
                        a &&
                        !i.rules.getOccupiedSubCells(this.theaterType).includes(e.position.desiredSubCell)) ||
                      n.push(r));
              return n;
            }
            dispose() {
              (this.tileOccupation.onChange.unsubscribe(this.handleTileOccupationUpdate),
                this.mapBounds.onLocalResize.unsubscribe(this.handleMapBoundsResize));
            }
          }),
        );
      },
    };
  },
);
