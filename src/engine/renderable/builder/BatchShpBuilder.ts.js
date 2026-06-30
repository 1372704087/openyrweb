// === Reconstructed SystemJS module: engine/renderable/builder/BatchShpBuilder ===
// deps: ["engine/renderable/builder/ShpTextureAtlas","engine/gfx/SpriteUtils","engine/gfx/TextureUtils","engine/gfx/material/PaletteBasicMaterial"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/builder/BatchShpBuilder",
  [
    "engine/renderable/builder/ShpTextureAtlas",
    "engine/gfx/SpriteUtils",
    "engine/gfx/TextureUtils",
    "engine/gfx/material/PaletteBasicMaterial",
  ],
  function (e, t) {
    "use strict";
    var i, l, c, h, r;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
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
      ],
      execute: function () {
        e(
          "BatchShpBuilder",
          (r = class {
            get verticesPerSprite() {
              return l.SpriteUtils.VERTICES_PER_SPRITE;
            }
            get trianglesPerSprite() {
              return l.SpriteUtils.TRIANGLES_PER_SPRITE;
            }
            constructor(e, t, i, r, s = 1, a = !1, n = 1e4, o = 1) {
              ((this.shpFile = e),
                (this.palette = t),
                (this.camera = i),
                (this.textureCache = r),
                (this.opacity = s),
                (this.transparent = a),
                (this.batchSize = n),
                (this.scale = o),
                (this.specIndexes = new Map()));
            }
            initTexture() {
              var e;
              this.textureCache.has(this.shpFile)
                ? (this.atlas = this.textureCache.get(this.shpFile))
                : ((e = new i.ShpTextureAtlas().fromShpFile(this.shpFile)),
                  this.textureCache.set(this.shpFile, e),
                  (this.atlas = e));
            }
            getSpriteGeometryOptions(e) {
              var t = this.shpFile.getImage(e.frameNo),
                t = { x: t.x - e.shpFile.width / 2 + e.offset.x, y: t.y - e.shpFile.height / 2 + e.offset.y };
              return {
                texture: this.atlas.getTexture(),
                textureArea: this.atlas.getTextureArea(e.frameNo),
                flat: e.flat,
                depth: e.depth,
                align: { x: 1, y: -1 },
                offset: t,
                camera: this.camera,
                scale: this.scale,
              };
            }
            setPalette(t) {
              if (((this.palette = t), this.mesh)) {
                var i = c.TextureUtils.textureFromPalette(t);
                let e = this.mesh.material;
                e.palette = i;
              }
            }
            build() {
              if (this.mesh) return this.mesh;
              this.initTexture();
              var e = c.TextureUtils.textureFromPalette(this.palette);
              let t = new THREE.BufferGeometry();
              var i,
                r = this.batchSize * this.verticesPerSprite,
                s = new THREE.BufferAttribute(new Float32Array(3 * r), 3);
              (t.addAttribute("position", s),
                (this.positionAttribute = s),
                t.addAttribute("uv", new THREE.BufferAttribute(new Float32Array(2 * r), 2)),
                l.SpriteUtils.USE_INDEXED_GEOMETRY &&
                  ((i = this.batchSize * this.trianglesPerSprite * 3),
                  t.setIndex(new THREE.BufferAttribute(new Uint32Array(3 * i), 1))));
              var a,
                r = new THREE.BufferAttribute(new Float32Array(4 * r), 4);
              (t.addAttribute("vertexColorMult", r), (this.colorMultAttribute = r));
              let n = 0;
              for (a of this.specIndexes.keys()) (this.specIndexes.set(a, n), this.setSpecGeometry(a, t, n), n++);
              if (((this.firstFreeSpriteIdx = n < this.batchSize ? n : -1), n < this.batchSize)) {
                let e = s.array;
                for (let t = n; t < this.batchSize - 1; t++) e[t * this.verticesPerSprite * 3] = t + 1;
                e[(this.batchSize - 1) * this.verticesPerSprite * 3] = -1;
              }
              e = new h.PaletteBasicMaterial({
                map: this.atlas.getTexture(),
                palette: e,
                alphaTest: this.transparent ? 0.05 : 0.5,
                flatShading: !0,
                transparent: this.transparent,
                opacity: this.opacity,
                useVertexColorMult: !0,
              });
              let o = new THREE.Mesh(t, e);
              return ((o.matrixAutoUpdate = !1), (o.frustumCulled = !1), (this.mesh = o), o);
            }
            add(e) {
              if (!this.specIndexes.has(e)) {
                if (this.isFull()) throw new Error("Batch is full");
                var t = this.mesh?.geometry;
                if (t) {
                  var i = this.firstFreeSpriteIdx;
                  if (-1 === i) throw new Error("No free sprite index found");
                  this.specIndexes.set(e, i);
                  var r = (this.positionAttribute?.array)[i * this.verticesPerSprite * 3];
                  (this.setSpecGeometry(e, t, i), (this.firstFreeSpriteIdx = r));
                } else this.specIndexes.set(e, void 0);
              }
            }
            setSpecGeometry(e, t, i) {
              var r = this.getSpriteGeometryOptions(e);
              let s = l.SpriteUtils.createSpriteGeometry(r);
              r = e.position;
              s.applyMatrix(new THREE.Matrix4().makeTranslation(r.x, r.y, r.z));
              let a = s;
              if (a.getAttribute("position").count !== this.verticesPerSprite) throw new Error("Vertex count mismatch");
              (t.merge(a, i * this.verticesPerSprite),
                a.index &&
                  (t.index.array.set(
                    Uint32Array.from(a.index.array, (e) => e + i * this.verticesPerSprite),
                    i * a.index.array.length,
                  ),
                  (t.index.needsUpdate = !0)));
              var n,
                r = e.lightMult ?? new THREE.Vector3(1, 1, 1);
              (this.setLightingAt(i, r, this.colorMultAttribute.array),
                this.setVisibilityAt(i, !0, this.colorMultAttribute.array));
              for (n of Object.values(t.attributes)) n.needsUpdate = !0;
            }
            has(e) {
              return this.specIndexes.has(e);
            }
            remove(t) {
              if (this.specIndexes.has(t)) {
                if (this.mesh) {
                  var i = this.specIndexes.get(t);
                  (this.setVisibilityAt(i, !1, this.colorMultAttribute.array),
                    (this.colorMultAttribute.needsUpdate = !0));
                  let e = this.positionAttribute.array;
                  ((e[i * this.verticesPerSprite * 3] = this.firstFreeSpriteIdx), (this.firstFreeSpriteIdx = i));
                }
                this.specIndexes.delete(t);
              }
            }
            update(e) {
              var t;
              !this.specIndexes.has(e) ||
                ((t = this.mesh?.geometry) && this.setSpecGeometry(e, t, this.specIndexes.get(e)));
            }
            isFull() {
              return this.specIndexes.size === this.batchSize;
            }
            isEmpty() {
              return 0 === this.specIndexes.size;
            }
            setLightingAt(e, t, i) {
              for (let r = 0; r < this.verticesPerSprite; r++)
                ((i[e * this.verticesPerSprite * 4 + 4 * r] = t.x),
                  (i[e * this.verticesPerSprite * 4 + 4 * r + 1] = t.y),
                  (i[e * this.verticesPerSprite * 4 + 4 * r + 2] = t.z));
            }
            setVisibilityAt(e, t, i) {
              for (let r = 0; r < this.verticesPerSprite; r++)
                i[e * this.verticesPerSprite * 4 + 4 * r + 3] = t ? 1 : 0;
            }
            updateLighting() {
              if (this.mesh) {
                let r = this.colorMultAttribute.array;
                (this.specIndexes.forEach((e, t) => {
                  var i = t.lightMult ?? new THREE.Vector3(1, 1, 1);
                  this.setLightingAt(e, i, r);
                }),
                  (this.colorMultAttribute.needsUpdate = !0));
              }
            }
            dispose() {
              this.mesh && (this.mesh.geometry.dispose(), this.mesh.material.dispose());
            }
          }),
        );
      },
    };
  },
);
