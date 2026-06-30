// === Reconstructed SystemJS module: game/map/TileCollection ===
// deps: ["game/type/LandType","engine/type/TerrainType","util/typeGuard"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/map/TileCollection",
  ["game/type/LandType", "engine/type/TerrainType", "util/typeGuard"],
  function (t, e) {
    "use strict";
    var E, C, r, s, i;
    e && e.id;
    return {
      setters: [
        function (e) {
          E = e;
        },
        function (e) {
          C = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        var e;
        (((e = s || t("TileDirection", (s = {})))[(e.Top = 0)] = "Top"),
          (e[(e.TopLeft = 1)] = "TopLeft"),
          (e[(e.TopRight = 2)] = "TopRight"),
          (e[(e.Left = 3)] = "Left"),
          (e[(e.Right = 4)] = "Right"),
          (e[(e.BottomLeft = 5)] = "BottomLeft"),
          (e[(e.Bottom = 6)] = "Bottom"),
          (e[(e.BottomRight = 7)] = "BottomRight"),
          t(
            "TileCollection",
            (i = class {
              constructor(e, t, i, r) {
                ((this.tileSets = t), (this.generalRules = i));
                let s = (this.rSize = { width: 0, height: 0 }),
                  a = (this.dSize = { width: 0, height: 0 });
                for (let v = 0, b = e.length; v < b; ++v)
                  ((s.width = Math.max(s.width, e[v].rx)),
                    (s.height = Math.max(s.height, e[v].ry)),
                    (a.width = Math.max(a.width, e[v].dx)),
                    (a.height = Math.max(a.height, e[v].dy)));
                (s.width++, s.height++, a.width++, a.height++);
                let n = (this.tilesByRxy = new Array(s.width * s.height));
                n.fill(void 0);
                let o = (this.tilesByDxy = new Array(a.width * a.height));
                o.fill(void 0);
                let l = (this.tiles = new Array(e.length)),
                  c = [],
                  h = (this.bridgeSetTiles = []),
                  u = new Set(Object.values(C.TerrainType));
                this.minTileHeight = Number.POSITIVE_INFINITY;
                for (let S = (this.maxTileHeight = 0), w = e.length; S < w; ++S) {
                  var d = e[S],
                    g = t.getTileImage(d.tileNum, d.subTile, r),
                    p = g.terrainType;
                  if (!u.has(p)) throw new Error(`Tile (${d.rx}, ${d.ry}) has unknown terrain type "${p}"`);
                  var m = {
                      ...d,
                      terrainType: p,
                      landType: E.getLandType(p),
                      onBridgeLandType: void 0,
                      rampType: g.rampType,
                      id: d.rx + "_" + d.ry,
                      occluded: !1,
                    },
                    f = m.rx,
                    y = m.ry,
                    T = m.dx,
                    p = m.dy;
                  ((l[S] = m),
                    (n[f + y * s.width] = m),
                    (o[T + p * a.width] = m),
                    (this.minTileHeight = Math.min(this.minTileHeight, m.z)),
                    (this.maxTileHeight = Math.max(this.maxTileHeight, m.z)),
                    4 !== g.height || (m.terrainType !== C.TerrainType.Cliff && !t.isCliffTile(m.tileNum)) || c.push(m),
                    t.isHighBridgeBoundaryTile(d.tileNum) && h.push(m));
                }
                (this.computeLandBehindCliffTiles(c), (this.cutoffTileHeight = this.computeCutoffTileHeight()));
              }
              computeLandBehindCliffTiles(t) {
                if (!(this.generalRules.cliffBackImpassability < 2)) {
                  let e = [
                    [-2, -2],
                    [-1, -1],
                    [-1, 1],
                    [1, -1],
                    [0, 1],
                    [1, 0],
                  ];
                  t.forEach((t) => {
                    for (var [i, r] of e) {
                      let e = this.getByMapCoords(t.rx + i, t.ry + r);
                      e &&
                        4 <= t.z - e.z &&
                        e.terrainType !== C.TerrainType.Cliff &&
                        e.terrainType !== C.TerrainType.Rough &&
                        (e.landType = E.LandType.Rock);
                    }
                  });
                }
              }
              getTileRadarColor(e) {
                let t = this.tileSets.getTileImage(e.tileNum, e.subTile, () => 0);
                return t.radarLeft.clone().multiplyScalar(0.5);
              }
              getAll() {
                return [...this.tiles];
              }
              forEach(e) {
                for (let t = 0, i = this.tiles.length; t < i; ++t) e(this.tiles[t], t);
              }
              reduce(t, e) {
                let i = e;
                return (
                  this.forEach((e) => {
                    i = t(i, e);
                  }),
                  i
                );
              }
              getMinTileHeight() {
                return this.minTileHeight;
              }
              getMaxTileHeight() {
                return this.maxTileHeight;
              }
              getCutoffTileHeight() {
                return this.cutoffTileHeight;
              }
              computeCutoffTileHeight() {
                var t = this.dSize.width - 1;
                let i = this.dSize.height - 1,
                  r = 0,
                  s = !0;
                for (; s && 0 < i;) {
                  for (let e = 1; e < t - 3; e++) {
                    var a = this.getByDisplayCoords(e, i);
                    a && ((s = !1), a.z > r && (r = a.z));
                  }
                  s && i--;
                }
                return r;
              }
              getAllBridgeSetTiles() {
                return this.bridgeSetTiles;
              }
              getAllNeighbourTiles(e) {
                var t = e.rx,
                  i = e.ry;
                return [
                  this.getByMapCoords(t + 1, i + 1),
                  this.getByMapCoords(t - 1, i - 1),
                  this.getByMapCoords(t - 1, i + 1),
                  this.getByMapCoords(t + 1, i - 1),
                  this.getByMapCoords(t, i + 1),
                  this.getByMapCoords(t + 1, i),
                  this.getByMapCoords(t - 1, i),
                  this.getByMapCoords(t, i - 1),
                ].filter(r.isNotNullOrUndefined);
              }
              getNeighbourTile(e, t) {
                var i = e.rx,
                  r = e.ry;
                switch (t) {
                  case s.Bottom:
                    return this.getByMapCoords(i + 1, r + 1);
                  case s.Top:
                    return this.getByMapCoords(i - 1, r - 1);
                  case s.Left:
                    return this.getByMapCoords(i - 1, r + 1);
                  case s.Right:
                    return this.getByMapCoords(i + 1, r - 1);
                  case s.BottomLeft:
                    return this.getByMapCoords(i, r + 1);
                  case s.BottomRight:
                    return this.getByMapCoords(i + 1, r);
                  case s.TopLeft:
                    return this.getByMapCoords(i - 1, r);
                  case s.TopRight:
                    return this.getByMapCoords(i, r - 1);
                  default:
                    throw new Error("Invalid direction");
                }
              }
              getByDisplayCoords(e, t) {
                if (!(e >= this.dSize.width || t >= this.dSize.height))
                  return this.tilesByDxy[e + t * this.dSize.width];
              }
              getByMapCoords(e, t) {
                if (!(e >= this.rSize.width || t >= this.rSize.height))
                  return this.tilesByRxy[e + t * this.rSize.width];
              }
              getMapSize() {
                return this.rSize;
              }
              getDisplaySize() {
                return this.dSize;
              }
              getInRectangle(e, t) {
                let i, r, s, a;
                a = t
                  ? ((i = e.rx), (r = e.ry), (s = t.width), t.height)
                  : ((i = e.x), (r = e.y), (s = e.width), e.height);
                let n = [];
                for (let c = 0; c < s; c++)
                  for (let e = 0; e < a; e++) {
                    var o = i + c,
                      l = r + e,
                      l = this.getByMapCoords(o, l);
                    l && n.push(l);
                  }
                return n;
              }
              getPlaceholderTile(e, t) {
                var i = this.tiles[0],
                  i = i.dx - i.rx + i.ry + 1;
                return {
                  rx: e,
                  ry: t,
                  dx: e - t + i - 1,
                  dy: e + t - i - 1,
                  z: 0,
                  id: e + "_" + t,
                  landType: E.LandType.Rock,
                  terrainType: C.TerrainType.Rock1,
                  rampType: 0,
                  subTile: 0,
                  tileNum: 0,
                  occluded: !1,
                  onBridgeLandType: void 0,
                };
              }
            }),
          ));
      },
    };
  },
);
