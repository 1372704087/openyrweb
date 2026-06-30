// === Reconstructed SystemJS module: engine/renderable/entity/map/MapShroudLayer ===
// deps: ["game/Coords","engine/gfx/TextureUtils","engine/gfx/SpriteUtils","util/disposable/CompositeDisposable","engine/renderable/builder/ShpTextureAtlas","data/Palette","util/Color","game/map/MapShroud","engine/gfx/BufferGeometryUtils","engine/gfx/material/PaletteBasicMaterial","engine/Engine"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/map/MapShroudLayer",
  [
    "game/Coords",
    "engine/gfx/TextureUtils",
    "engine/gfx/SpriteUtils",
    "util/disposable/CompositeDisposable",
    "engine/renderable/builder/ShpTextureAtlas",
    "data/Palette",
    "util/Color",
    "game/map/MapShroud",
    "engine/gfx/BufferGeometryUtils",
    "engine/gfx/material/PaletteBasicMaterial",
    "engine/Engine",
  ],
  function (e, t) {
    "use strict";
    var n, f, y, r, T, v, b, o, S, w, E, l, c, h, i;
    t && t.id;
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
          r = e;
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
          o = e;
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
      ],
      execute: function () {
        ((l = [
          [1, 32],
          [4, 33],
          [8, 34],
          [2, 35],
          [5, 36],
          [12, 37],
          [10, 38],
          [3, 39],
          [13, 40],
          [14, 41],
          [11, 42],
          [7, 43],
          [9, 44],
          [6, 45],
          [15, 46],
        ].reduce((e, t) => ((e[t[0]] = t[1]), e), new Array(16).fill(void 0))),
          (c = [
            [24, 16],
            [34, 17],
            [50, 18],
            [65, 19],
            [97, 20],
            [132, 21],
            [152, 22],
            [196, 23],
            [18, 24],
            [33, 25],
            [68, 26],
            [136, 27],
            [26, 28],
            [35, 29],
            [69, 30],
            [140, 31],
          ].reduce((e, t) => ((e[t[0]] = t[1]), e), new Array(256).fill(void 0))),
          (h = [0, 5, 12, 13, 10, 15, 14, 15, 3, 7, 15, 15, 11, 15, 15, 15]),
          e(
            "MapShroudLayer",
            (i = class {
              constructor(e, t, i) {
                ((this.shroud = e),
                  (this.imageFinder = t),
                  (this.camera = i),
                  (this.disposables = new r.CompositeDisposable()),
                  (this.needsIncrementalUpdate = []),
                  (this.needsFullUpdate = !1),
                  (this.onShroudChange = (e) => {
                    "incremental" === e.type
                      ? this.needsIncrementalUpdate.push(...e.coords)
                      : (this.needsFullUpdate = e.type);
                  }),
                  (this.camera = i));
              }
              get3DObject() {
                return this.target;
              }
              create3DObject() {
                let e = this.get3DObject();
                e ||
                  ((e = new THREE.Object3D()),
                  (e.name = "map_shroud_layer"),
                  (e.matrixAutoUpdate = !1),
                  (this.target = e),
                  this.createTileObjects(e),
                  this.shroud.onChange.subscribe(this.onShroudChange),
                  this.disposables.add(() => this.shroud.onChange.unsubscribe(this.onShroudChange)));
              }
              setShroud(e) {
                (this.shroud.onChange.unsubscribe(this.onShroudChange),
                  (this.shroud = e),
                  this.shroud.onChange.subscribe(this.onShroudChange),
                  (this.needsFullUpdate = "full"));
              }
              createTileObjects(e) {
                var t = this.imageFinder.find(E.Engine.shroudFileName.split(".")[0], !1);
                let i = new T.ShpTextureAtlas().fromShpFile(t);
                this.disposables.add(i);
                let r = new v.Palette(),
                  s = [new b.Color(0, 0, 0), new b.Color(0, 0, 0)];
                for (let g = 0; g < 254; g++) {
                  var a = Math.min(255, Math.floor((g / 125) * 255));
                  s.push(new b.Color(a, a, a));
                }
                r.setColors(s);
                t = f.TextureUtils.textureFromPalette(r);
                let n = [],
                  o = 0;
                var l = this.shroud.getSize();
                for (let p = 0; p < l.height; p++)
                  for (let e = 0; e < l.width; e++) {
                    var c = { sx: e, sy: p },
                      h = this.getFrameNo(c),
                      h = this.createTileGeometry(c, i, h);
                    (n.push(h), o++);
                  }
                t = new w.PaletteBasicMaterial({
                  map: i.getTexture(),
                  palette: t,
                  alphaTest: 0.01,
                  flatShading: !0,
                  transparent: !0,
                  depthTest: !1,
                  blending: THREE.MultiplyBlending,
                });
                let u = S.BufferGeometryUtils.mergeBufferGeometries(n);
                if (u.getAttribute("position").count !== y.SpriteUtils.VERTICES_PER_SPRITE * o)
                  throw new Error("Vertex count mismatch");
                this.uvAttribute = u.getAttribute("uv");
                ((this.uvElemsPerPiece = (this.uvAttribute.count * this.uvAttribute.itemSize) / o),
                  (this.uvLookup = new Float32Array(47 * this.uvElemsPerPiece)));
                for (let m = 0; m < 47; m++) {
                  let e = y.SpriteUtils.createSpriteGeometry(this.getTileGeometryOptions(i, m));
                  this.uvLookup.set(e.getAttribute("uv").array, m * this.uvElemsPerPiece);
                }
                n.forEach((e) => e.dispose());
                let d = new THREE.Mesh(u, t);
                ((d.renderOrder = 999999),
                  (d.matrixAutoUpdate = !1),
                  (d.frustumCulled = !1),
                  e.add(d),
                  this.disposables.add(u, t));
              }
              createTileGeometry(e, t, i) {
                var { rx: r, ry: s } = this.shroud.shroudCoordsToWorld(e),
                  s = n.Coords.tile3dToWorld(r, s, 0);
                let a = y.SpriteUtils.createSpriteGeometry(this.getTileGeometryOptions(t, i));
                return (a.applyMatrix(new THREE.Matrix4().makeTranslation(s.x, s.y, s.z)), a);
              }
              getTileGeometryOptions(e, t) {
                return {
                  texture: e.getTexture(),
                  textureArea: e.getTextureArea(t),
                  flat: !0,
                  align: { x: 0, y: -1 },
                  camera: this.camera,
                  scale: n.Coords.ISO_WORLD_SCALE,
                };
              }
              update(e) {
                var t;
                (this.needsFullUpdate &&
                  ("cover" === this.needsFullUpdate || "clear" === this.needsFullUpdate
                    ? this.toggleAllTiles(
                        "cover" === this.needsFullUpdate ? o.ShroudType.Unexplored : o.ShroudType.Explored,
                      )
                    : (this.updateAllTiles(), (this.needsIncrementalUpdate = [])),
                  (this.uvAttribute.needsUpdate = !0),
                  (this.needsFullUpdate = !1)),
                  this.needsIncrementalUpdate.length &&
                    ((t = this.extendToAdjacentTiles(this.needsIncrementalUpdate)),
                    this.updateTiles(t),
                    (this.uvAttribute.needsUpdate = !0),
                    (this.needsIncrementalUpdate.length = 0)));
              }
              extendToAdjacentTiles(e) {
                let i = new Map();
                var r,
                  s = this.shroud.getSize();
                for (r of e)
                  for (let t = -1; t <= 1; t++)
                    for (let e = -1; e <= 1; e++) {
                      var a = r.sx + t,
                        n = r.sy + e;
                      0 <= a && 0 <= n && a < s.width && n < s.height && i.set(a + "_" + n, { sx: a, sy: n });
                    }
                return [...i.values()];
              }
              updateTiles(e) {
                var t,
                  i = this.shroud.getSize();
                for (t of e) {
                  var r = t.sx + t.sy * i.width;
                  this.updateTilePiece(r, this.getFrameNo(t));
                }
              }
              updateAllTiles() {
                var t = this.shroud.getSize();
                for (let s = 0; s < t.height; s++)
                  for (let e = 0; e < t.width; e++) {
                    var i = { sx: e, sy: s },
                      r = i.sx + i.sy * t.width;
                    this.updateTilePiece(r, this.getFrameNo(i));
                  }
              }
              toggleAllTiles(e) {
                var t = e === o.ShroudType.Unexplored ? 15 : 0,
                  i = this.uvLookup.subarray(t * this.uvElemsPerPiece, (1 + t) * this.uvElemsPerPiece);
                let r = this.uvAttribute.array;
                t = this.shroud.getSize();
                for (let s = 0, a = t.width * t.height; s < a; s++) r.set(i, s * this.uvElemsPerPiece);
              }
              updateTilePiece(e, t) {
                this.uvAttribute.array.set(
                  this.uvLookup.subarray(t * this.uvElemsPerPiece, (t + 1) * this.uvElemsPerPiece),
                  e * this.uvElemsPerPiece,
                );
              }
              getFrameNo(t) {
                var i;
                if (this.shroud.getShroudTypeByShroudCoords(t) === o.ShroudType.Unexplored) return 15;
                let e = 0;
                (this.hasShroudedNeighbour(t, 0, -1) && (e += 1),
                  this.hasShroudedNeighbour(t, 1, 0) && (e += 2),
                  this.hasShroudedNeighbour(t, 0, 1) && (e += 4),
                  this.hasShroudedNeighbour(t, -1, 0) && (e += 8));
                let r = 0;
                for (let a = -1; a <= 1; a += 2)
                  for (let e = -1; e <= 1; e += 2)
                    this.hasShroudedNeighbour(t, a, e) && ((i = a + 1 + ((e + 1) >> 1)), (r += 1 << i));
                if (0 < r)
                  if (0 === e) e = l[r];
                  else {
                    var s = r & ~h[e];
                    if (0 < s) {
                      s = c[s + (e << 4)];
                      if (void 0 === s)
                        throw new Error(
                          `Missing mapped corner frame number for cornerValue "${r}",` + "edgeFrameNo=" + e,
                        );
                      e = s;
                    }
                  }
                return e;
              }
              hasShroudedNeighbour({ sx: e, sy: t }, i, r) {
                return this.shroud.getShroudTypeByShroudCoords({ sx: e + i, sy: t + r }) === o.ShroudType.Unexplored;
              }
              dispose() {
                this.disposables.dispose();
              }
            }),
          ));
      },
    };
  },
);
