// === Reconstructed SystemJS module: game/map/Bridges ===
// deps: ["game/map/TileCollection","game/map/BridgeOverlayTypes","game/theater/TileSets","game/map/tileFinder/DirectionalTileFinder","game/map/tileFinder/RadialTileFinder","game/math/Vector2"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/map/Bridges",
  [
    "game/map/TileCollection",
    "game/map/BridgeOverlayTypes",
    "game/theater/TileSets",
    "game/map/tileFinder/DirectionalTileFinder",
    "game/map/tileFinder/RadialTileFinder",
    "game/math/Vector2",
  ],
  function (t, e) {
    "use strict";
    var n, f, y, T, r, s, v, i;
    e && e.id;
    return {
      setters: [
        function (e) {
          n = e;
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
          r = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        var e;
        (((e = v || t("BridgeHeadType", (v = {})))[(e.None = 0)] = "None"),
          (e[(e.Start = 1)] = "Start"),
          (e[(e.End = 2)] = "End"),
          t(
            "Bridges",
            (i = class {
              constructor(e, t, i, r, s) {
                ((this.tileSets = e),
                  (this.tiles = t),
                  (this.tileOccupation = i),
                  (this.mapBounds = r),
                  (this.rules = s),
                  (this.pieces = new Set()),
                  (this.piecesByTile = new Map()),
                  (this.handleTileOccupationUpdate = ({ object: t, type: i }) => {
                    if (t.isOverlay() && t.isBridge()) {
                      var r = t.tile;
                      let e = this.piecesByTile.get(r);
                      if ("added" === i) {
                        if (e) throw new Error(`A bridge piece already exists at tile (${r.rx},${r.ry})`);
                        var s = this.findBridgeAdjacentTiles(t);
                        ((e = { obj: t, prev: void 0, next: void 0, headType: this.computeHead(t, s.prev, s.next) }),
                          this.piecesByTile.set(r, e),
                          this.pieces.add(e),
                          this.connectPiece(e, s.prev, s.next),
                          this.updateOverlayData(e),
                          e.prev && this.updateOverlayData(e.prev),
                          e.next && this.updateOverlayData(e.next));
                      } else {
                        if (!e) throw new Error(`Bridge piece was alredy removed at tile (${r.rx},${r.ry})`);
                        var a = e.prev,
                          s = e.next;
                        (this.disconnectPiece(e),
                          this.piecesByTile.delete(r),
                          this.pieces.delete(e),
                          a && this.updateOverlayData(a),
                          s && this.updateOverlayData(s));
                      }
                    }
                  }),
                  i.onChange.subscribe(this.handleTileOccupationUpdate));
              }
              getPieceAtTile(e) {
                return this.piecesByTile.get(e);
              }
              handlePieceHealthChange(e) {
                (this.updateOverlayData(e),
                  e.prev && this.updateOverlayData(e.prev),
                  e.next && this.updateOverlayData(e.next));
              }
              findDominoPieces(t) {
                let i = [],
                  r = !1,
                  e = t.next;
                if (t.headType === v.None || e)
                  for (; e;) {
                    if ((i.push(e), e.headType !== v.None)) {
                      r = !0;
                      break;
                    }
                    e = e.next;
                  }
                else r = !0;
                if (r) {
                  ((r = !1), (i.length = 0));
                  let e = t.prev;
                  if (t.headType === v.None || e)
                    for (; e;) {
                      if ((i.push(e), e.headType !== v.None)) {
                        r = !0;
                        break;
                      }
                      e = e.prev;
                    }
                  else r = !0;
                  if (r) return [];
                }
                return i;
              }
              findBridgeAdjacentTiles(e) {
                var t = e.isXBridge(),
                  i = new s.Vector2(Number(t), Number(!t));
                let r = new s.Vector2(e.tile.rx, e.tile.ry);
                ((t = r.clone().sub(i)), (t = this.tiles.getByMapCoords(t.x, t.y)), (i = r.clone().add(i)));
                return { prev: t, next: this.tiles.getByMapCoords(i.x, i.y) };
              }
              connectPiece(e, t, i) {
                (t && ((e.prev = this.getPieceAtTile(t)), e.prev && (e.prev.next = e)),
                  i && ((e.next = this.getPieceAtTile(i)), e.next && (e.next.prev = e)));
              }
              disconnectPiece(e) {
                (e.next && ((e.next.prev = void 0), (e.next = void 0)),
                  e.prev && ((e.prev.next = void 0), (e.prev = void 0)));
              }
              computeHead(e, t, i) {
                var r = e.tile;
                if (e.isHighBridge()) {
                  r = r.z + e.tileElevation;
                  return t?.z === r ? v.Start : i?.z === r ? v.End : v.None;
                }
                return f.BridgeOverlayTypes.isLowBridgeHead(e.overlayId)
                  ? f.BridgeOverlayTypes.isLowBridgeHeadStart(e.overlayId)
                    ? v.Start
                    : v.End
                  : v.None;
              }
              updateOverlayData(t) {
                let i = t.obj,
                  r = t.prev,
                  s = t.next,
                  a = !1;
                var n = i.isXBridge(),
                  o = f.BridgeOverlayTypes.getOverlayBridgeType(i.overlayId);
                if (f.BridgeOverlayTypes.isLowBridgeHead(i.overlayId)) {
                  let e = 0;
                  (f.BridgeOverlayTypes.isLowBridgeHeadStart(i.overlayId)
                    ? ((e = n ? 20 : 22), s || e++)
                    : ((e = n ? 18 : 24), r || e++),
                    (i.overlayId =
                      (o === f.OverlayBridgeType.Wood
                        ? f.BridgeOverlayTypes.minLowBridgeWoodId
                        : f.BridgeOverlayTypes.minLowBridgeConcreteId) + e),
                    (i.value = e),
                    (a = !0));
                } else {
                  let e;
                  var l,
                    c,
                    h = (i.healthTrait?.health ?? 100) <= 50;
                  ((e =
                    t.headType !== v.None
                      ? t.headType === v.Start
                        ? s
                          ? h
                            ? 6
                            : (s.obj.healthTrait?.health ?? 100) <= 50
                              ? 5
                              : 0
                          : n
                            ? 8
                            : 7
                        : r
                          ? h
                            ? 6
                            : (r.obj.healthTrait?.health ?? 100) <= 50
                              ? 4
                              : 0
                          : n
                            ? 7
                            : 8
                      : (n || ((c = r), (r = s), (s = c)),
                        r || s
                          ? r
                            ? s
                              ? ((l = (r.obj.healthTrait?.health ?? 100) <= 50),
                                (c = (s.obj.healthTrait?.health ?? 100) <= 50),
                                h || (l && c) ? 6 : l ? 4 : c ? 5 : 0)
                              : 8
                            : 7
                          : 0)),
                    n || (e += 9),
                    i.isHighBridge()
                      ? (i.value = e)
                      : ((i.overlayId =
                          (o === f.OverlayBridgeType.Wood
                            ? f.BridgeOverlayTypes.minLowBridgeWoodId
                            : f.BridgeOverlayTypes.minLowBridgeConcreteId) + e),
                        (i.value = e),
                        (a = !0)));
                }
                a && (i.name = this.rules.getOverlayName(i.overlayId));
              }
              findClosestBridgeSpec(i) {
                let e = new r.RadialTileFinder(
                  this.tiles,
                  this.mapBounds,
                  i,
                  { width: 1, height: 1 },
                  1,
                  3,
                  (e) => {
                    if (e.z !== i.z) return !1;
                    let t = this.tileOccupation.getBridgeOnTile(e);
                    return (
                      !(!t?.isLowBridge() || this.getPieceAtTile(t.tile)?.headType === v.None) ||
                      !!this.tileSets.isHighBridgeBoundaryTile(e.tileNum)
                    );
                  },
                  !1,
                );
                var o = e.getNextTile();
                if (o) {
                  let r, t, s, a;
                  var l = !this.tileOccupation.getBridgeOnTile(o);
                  let e;
                  if (l) {
                    var c = this.findHighBridgeBoundary(o);
                    if (!c) return;
                    ((r = c.tile),
                      (t = f.OverlayBridgeType.Concrete),
                      this.tileSets.getSetNum(o.tileNum) === this.tileSets.getGeneralValue("WoodBridgeSet") &&
                        (t = f.OverlayBridgeType.Wood),
                      (s =
                        c.headType === y.HighBridgeHeadType.TopLeft || c.headType === y.HighBridgeHeadType.BottomRight),
                      (a = c.headType === y.HighBridgeHeadType.TopLeft || c.headType === y.HighBridgeHeadType.TopRight),
                      (e = c.headType));
                  } else {
                    r = this.tileOccupation.getBridgeOnTile(o).tile;
                    let e = this.getPieceAtTile(r);
                    if (!e) throw new Error("Bridge head is not defined");
                    var h = f.BridgeOverlayTypes.getOverlayBridgeType(e.obj.overlayId);
                    if (h === f.OverlayBridgeType.NotBridge) throw new Error("Expected a bridge type");
                    ((t = h), (s = e.obj.isXBridge()), (a = e.headType === v.Start));
                  }
                  var u = Number(s) * (a ? 1 : -1),
                    d = Number(!s) * (a ? 1 : -1);
                  let n;
                  if (l) {
                    ((o = new T.DirectionalTileFinder(
                      this.tiles,
                      this.mapBounds,
                      r,
                      1,
                      100,
                      u,
                      d,
                      (e) => e.z === r.z && this.tileSets.isHighBridgeBoundaryTile(e.tileNum),
                      !1,
                    ).getNextTile()),
                      (h = this.tileSets.getSetNum(r.tileNum)));
                    if (!o || this.tileSets.getSetNum(o.tileNum) !== h) return;
                    o = this.findHighBridgeBoundary(o);
                    if (!o) return;
                    if (e !== this.tileSets.getOppositeHighBridgeHeadType(o.headType)) return;
                    n = o.tile;
                  } else {
                    let t,
                      i = 1;
                    for (var g = r.rx, p = r.ry; !t;) {
                      var m = this.tiles.getByMapCoords(g + u * i, p + d * i);
                      if (!m) return;
                      let e = this.getPieceAtTile(m);
                      if (e && e.obj.isXBridge() !== s) return;
                      (e?.headType === (a ? v.End : v.Start) && (t = e), i++);
                    }
                    n = t.obj.tile;
                  }
                  return { start: a ? r : n, end: a ? n : r, type: t, isHigh: l, isXBridge: s };
                }
              }
              findHighBridgeBoundary(e) {
                let t = this.tileSets.getTile(e.tileNum);
                var s = this.tileSets.getHighBridgeHeadType(t.index);
                if (void 0 !== s) {
                  let i = 0,
                    r = 0;
                  switch (s) {
                    case y.HighBridgeHeadType.TopLeft:
                      ((i = 1), (r = 0));
                      break;
                    case y.HighBridgeHeadType.BottomRight:
                      ((i = -1), (r = 0));
                      break;
                    case y.HighBridgeHeadType.TopRight:
                      ((i = 0), (r = 1));
                      break;
                    case y.HighBridgeHeadType.BottomLeft:
                      ((i = 0), (r = -1));
                      break;
                    case y.HighBridgeHeadType.MiddleTlBr:
                      ((i = 1), (r = 0));
                      break;
                    case y.HighBridgeHeadType.MiddleTrBl:
                      ((i = 0), (r = 1));
                      break;
                    default:
                      throw new Error(`Unhandled head type "${s}"`);
                  }
                  const c = t.getRelativeTilePositions();
                  var a = c
                      .filter((e) => 4 === e.z)
                      .sort(
                        (e, t) => 100 * (i ? i * (t.rx - e.rx) : r * (t.ry - e.ry)) + (i ? e.ry - t.ry : e.rx - t.rx),
                      )[0].subTile,
                    n = c[a].rx - c[e.subTile].rx,
                    o = c[a].ry - c[e.subTile].ry,
                    l = this.tiles.getByMapCoords(e.rx + n, e.ry + o);
                  if (l) {
                    if (l.subTile === a && l.tileNum === e.tileNum) return { tile: l, headType: s };
                    console.warn("Found invalid bridge boundary tile. " + `(${e.rx},${e.ry})+(${n},${o})`);
                  }
                } else console.warn(`Couldn't find a valid bridge type for index "${t.index}" @ ${e.rx},` + e.ry);
              }
              canBeRepaired(i) {
                let e = this.createBridgePieceTileFinder(
                    i,
                    (e) =>
                      !(
                        this.getPieceAtTile(e) ||
                        (this.tileSets.isHighBridgeMiddleTile(e.tileNum) && e.z === i.start.z)
                      ),
                  ),
                  r = !1,
                  s;
                for (
                  var a = i.start.rx !== i.end.rx ? n.TileDirection.BottomLeft : n.TileDirection.BottomRight;
                  (s = e.getNextTile());
                ) {
                  r = !0;
                  let e = this.tiles.getNeighbourTile(s, a),
                    t = this.tiles.getNeighbourTile(e, a);
                  if (i.isHigh) {
                    if (
                      [s, e, t].find((e) =>
                        this.tileOccupation
                          .getGroundObjectsOnTile(e)
                          .some((e) => e.isBuilding() && !e.rules.invisibleInGame),
                      )
                    )
                      return !1;
                  } else if (
                    [s, e, t].find((e) =>
                      this.tileOccupation
                        .getGroundObjectsOnTile(e)
                        .some((e) => !(e.isUnit() || e.isSmudge() || (e.isOverlay() && e.isBridgePlaceholder()))),
                    )
                  )
                    return !1;
                }
                return r;
              }
              getPieceTiles(e) {
                var t = e.obj.tile,
                  i = e.obj.isXBridge() ? n.TileDirection.BottomLeft : n.TileDirection.BottomRight,
                  r = this.tiles.getNeighbourTile(t, i);
                return [t, r, this.tiles.getNeighbourTile(r, i)];
              }
              findMapHighBridgeHeadTiles() {
                var e,
                  t = this.tiles.getAllBridgeSetTiles();
                let i = new Set();
                for (e of t) {
                  var r = this.findHighBridgeBoundary(e);
                  r && i.add(r.tile);
                }
                return i;
              }
              findBridgeSpecsForHeadTiles(e) {
                let t = new Map();
                for (var i of e) {
                  i = this.findClosestBridgeSpec(i);
                  i && t.set(i.start.id + ":" + i.end.id, i);
                }
                return [...t.values()];
              }
              findAllBridgeTiles(e) {
                let t = [];
                var i,
                  r = e.start.rx !== e.end.rx ? n.TileDirection.BottomLeft : n.TileDirection.BottomRight;
                for (i of this.findNonBuildablePieceTiles(e)) {
                  var s = this.tiles.getNeighbourTile(i, r),
                    a = this.tiles.getNeighbourTile(s, r);
                  t.push(i, s, a);
                }
                return t;
              }
              getBridgeSize(e) {
                var t = e.start.rx !== e.end.rx;
                return { width: t ? e.end.rx - e.start.rx + 1 : 3, height: t ? 3 : e.end.ry - e.start.ry + 1 };
              }
              findBridgePieces(e) {
                let t = this.createBridgePieceTileFinder(e, (e) => !!this.getPieceAtTile(e)),
                  i = [];
                for (var r; (r = t.getNextTile());) i.push(this.getPieceAtTile(r));
                return i;
              }
              findDestroyedPieceTiles(t) {
                let e = this.createBridgePieceTileFinder(
                    t,
                    (e) =>
                      !(
                        this.getPieceAtTile(e) ||
                        (this.tileSets.isHighBridgeMiddleTile(e.tileNum) && e.z === t.start.z)
                      ),
                  ),
                  i = [];
                for (var r; (r = e.getNextTile());) i.push(r);
                return i;
              }
              findNonBuildablePieceTiles(t) {
                let e = this.createBridgePieceTileFinder(
                    t,
                    (e) => !(this.tileSets.isHighBridgeMiddleTile(e.tileNum) && e.z === t.start.z),
                  ),
                  i = [];
                for (var r; (r = e.getNextTile());) i.push(r);
                return i;
              }
              createBridgePieceTileFinder(e, t) {
                var i = e.start.rx !== e.end.rx;
                return new T.DirectionalTileFinder(
                  this.tiles,
                  this.mapBounds,
                  e.start,
                  1,
                  (i ? e.end.rx - e.start.rx : e.end.ry - e.start.ry) - 1,
                  Number(i),
                  Number(!i),
                  t,
                  !1,
                );
              }
              dispose() {
                (this.pieces.forEach((e) => {
                  ((e.prev = void 0), (e.next = void 0));
                }),
                  this.tileOccupation.onChange.unsubscribe(this.handleTileOccupationUpdate));
              }
            }),
          ));
      },
    };
  },
);
