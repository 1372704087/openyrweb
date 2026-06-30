// === Reconstructed SystemJS module: engine/renderable/entity/map/MapTileLayer ===
// deps: ["game/Coords","engine/gfx/TextureUtils","engine/gfx/drawable/TmpDrawable","engine/gfx/TextureAtlas","engine/gfx/SpriteUtils","engine/renderable/entity/Anim","engine/type/LightingType","util/disposable/CompositeDisposable","engine/gfx/BufferGeometryUtils","engine/gfx/material/PaletteBasicMaterial","util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/map/MapTileLayer",
  [
    "game/Coords",
    "engine/gfx/TextureUtils",
    "engine/gfx/drawable/TmpDrawable",
    "engine/gfx/TextureAtlas",
    "engine/gfx/SpriteUtils",
    "engine/renderable/entity/Anim",
    "engine/type/LightingType",
    "util/disposable/CompositeDisposable",
    "engine/gfx/BufferGeometryUtils",
    "engine/gfx/material/PaletteBasicMaterial",
    "util/math",
  ],
  function (e, t) {
    "use strict";
    var A, M, R, P, I, k, B, h, N, j, L, i;
    t && t.id;
    return {
      setters: [
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
          B = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          N = e;
        },
        function (e) {
          j = e;
        },
        function (e) {
          L = e;
        },
      ],
      execute: function () {
        e(
          "MapTileLayer",
          (i = class {
            constructor(e, t, i, r, s, a, n, o, l, c) {
              ((this.theater = t),
                (this.art = i),
                (this.imageFinder = r),
                (this.camera = s),
                (this.debugFrame = a),
                (this.gameSpeed = n),
                (this.worldSound = o),
                (this.lighting = l),
                (this.useSpriteBatching = c),
                (this.tileIndexes = new Map()),
                (this.tileAnimLightMultsByTile = new Map()),
                (this.disposables = new h.CompositeDisposable()),
                (this.theater = t),
                (this.camera = s),
                (this.allTiles = e.tiles.getAll()));
            }
            get3DObject() {
              return this.target;
            }
            create3DObject() {
              let e = this.get3DObject();
              e ||
                ((e = new THREE.Object3D()),
                (e.name = "map_tile_layer"),
                (e.matrixAutoUpdate = !1),
                (this.target = e),
                this.createTileObjects(e));
            }
            createTileObjects(t) {
              let r = new Map(),
                s = new Map();
              var i,
                a = this.theater.isoPalette,
                e = M.TextureUtils.textureFromPalette(a);
              let n = this.theater.tileSets;
              for (i of this.allTiles) {
                var o = i.tileNum;
                let e = n.getTile(o);
                if (!e) return;
                var l = e.getTmpFile(i.subTile, L.getRandomInt);
                if (!l || i.subTile >= l.images.length) return;
                var c = l.images[i.subTile];
                (s.set(i, c),
                  (o = r.get(c)) || ((o = new R.TmpDrawable().draw(c, l.blockWidth, l.blockHeight)), r.set(c, o)));
              }
              let h = new P.TextureAtlas(),
                u = [];
              (r.forEach((e) => {
                u.push(e);
              }),
                h.pack(u),
                this.disposables.add(h));
              let d = [],
                g = [];
              for (let x = 0, O = this.allTiles.length; x < O; x++) {
                var p = this.allTiles[x],
                  m = s.get(p);
                if (!m) throw new Error(`Missing tmp image for tile rx,ry=${p.rx},` + p.ry);
                let e = 0,
                  t = 0;
                m.hasExtraData && ((e += Math.max(0, m.x - m.extraX)), (t += Math.max(0, m.y - m.extraY)));
                var f = A.Coords.tile3dToWorld(p.rx, p.ry, p.z),
                  y = r.get(m);
                let i = I.SpriteUtils.createSpriteGeometry({
                  texture: h.getTexture(),
                  textureArea: h.getImageRect(y),
                  align: { x: 0, y: -1 },
                  offset: { x: -e, y: -t },
                  camera: this.camera,
                  scale: A.Coords.ISO_WORLD_SCALE,
                });
                (i.applyMatrix(new THREE.Matrix4().makeTranslation(f.x, f.y, f.z)), d.push(i));
                var { x: m, y, z: f } = this.lighting.compute(B.LightingType.Full, p);
                (g.push(m, y, f), this.tileIndexes.set(p, x));
              }
              var T = new j.PaletteBasicMaterial({
                map: h.getTexture(),
                palette: e,
                alphaTest: 0.5,
                flatShading: !0,
                useVertexColorMult: !0,
              });
              let v = N.BufferGeometryUtils.mergeBufferGeometries(d);
              e = v.getAttribute("position").count;
              if (e !== (I.SpriteUtils.VERTICES_PER_SPRITE * g.length) / 3) throw new Error("Vertex count mismatch");
              e = new Float32Array(4 * e);
              this.updateColorMultBuffer(g, e);
              var b,
                e = new THREE.BufferAttribute(e, 4);
              (v.addAttribute("vertexColorMult", e), (this.colorMultAttribute = e), d.forEach((e) => e.dispose()));
              let S = new THREE.Mesh(v, T);
              ((S.matrixAutoUpdate = !1), (S.frustumCulled = !1), t.add(S), this.disposables.add(v, T));
              let w = [];
              for (b of this.allTiles) {
                var E = b.tileNum;
                let e = n.getTile(E);
                if (!e) return;
                var C = e.getAnimation();
                if (C && b.subTile === C.subTile) {
                  E = this.lighting.compute(B.LightingType.Full, b).addScalar(-1);
                  this.tileAnimLightMultsByTile.set(b, E);
                  let e = new k.Anim(
                    C.name,
                    this.art.getAnimation(C.name),
                    { x: C.offsetX, y: C.offsetY + (A.Coords.ISO_TILE_SIZE + 1) / 2 },
                    this.imageFinder,
                    this.theater,
                    this.camera,
                    this.debugFrame,
                    this.gameSpeed,
                    this.useSpriteBatching,
                    E,
                    this.worldSound,
                    a,
                  );
                  E = A.Coords.tile3dToWorld(b.rx, b.ry, b.z);
                  (e.setPosition(E), e.create3DObject(), w.push(e), t.add(e.get3DObject()), this.disposables.add(e));
                }
              }
              this.anims = w;
            }
            update(e) {
              for (var t of this.anims) t.update(e);
            }
            updateLighting(e) {
              if (e) {
                for (var t of e) {
                  var i,
                    r,
                    s,
                    a = this.tileIndexes.get(t);
                  (void 0 !== a &&
                    (({ x: i, y: r, z: s } = this.lighting.compute(B.LightingType.Full, t)),
                    this.updateColorMultBufferAtIndex(a, i, r, s, this.colorMultAttribute.array)),
                    this.tileAnimLightMultsByTile.get(t)?.copy(this.lighting.compute(B.LightingType.Full, t)));
                }
                this.colorMultAttribute.needsUpdate = !0;
              } else {
                let e = [];
                for (var n of this.allTiles) {
                  var { x: o, y: l, z: n } = this.lighting.compute(B.LightingType.Full, n);
                  e.push(o, l, n);
                }
                (this.updateColorMultBuffer(e, this.colorMultAttribute.array),
                  (this.colorMultAttribute.needsUpdate = !0),
                  this.tileAnimLightMultsByTile.forEach((e, t) => {
                    e.copy(this.lighting.compute(B.LightingType.Full, t));
                  }));
              }
            }
            updateColorMultBuffer(t, i) {
              var r = I.SpriteUtils.VERTICES_PER_SPRITE,
                e = t.length / 3;
              let s = 0;
              for (let l = 0; l < e; l++) {
                var a = t[3 * l],
                  n = t[3 * l + 1],
                  o = t[3 * l + 2];
                for (let e = 0; e < r; e++) ((i[s++] = a), (i[s++] = n), (i[s++] = o), (i[s++] = 1));
              }
            }
            updateColorMultBufferAtIndex(e, t, i, r, s) {
              var a = I.SpriteUtils.VERTICES_PER_SPRITE;
              let n = e * a * 4;
              for (let o = 0; o < a; o++) ((s[n++] = t), (s[n++] = i), (s[n++] = r), (s[n++] = 1));
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
