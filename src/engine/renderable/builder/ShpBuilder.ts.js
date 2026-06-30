// === Reconstructed SystemJS module: engine/renderable/builder/ShpBuilder ===
// deps: ["engine/gfx/TextureUtils","engine/gfx/SpriteUtils","engine/renderable/builder/ShpTextureAtlas","engine/gfx/material/PaletteBasicMaterial","engine/gfx/batch/BatchedMesh"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/builder/ShpBuilder",
  [
    "engine/gfx/TextureUtils",
    "engine/gfx/SpriteUtils",
    "engine/renderable/builder/ShpTextureAtlas",
    "engine/gfx/material/PaletteBasicMaterial",
    "engine/gfx/batch/BatchedMesh",
  ],
  function (e, t) {
    "use strict";
    var o, l, i, c, h, a;
    t && t.id;
    return {
      setters: [
        function (e) {
          o = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
      ],
      execute: function () {
        (e(
          "ShpBuilder",
          (a = class a {
            static prepareTexture(e) {
              var t;
              a.textureCache.has(e) || ((t = new i.ShpTextureAtlas().fromShpFile(e)), a.textureCache.set(e, t));
            }
            static clearCaches() {
              (a.textureCache.forEach((e) => e.dispose()),
                a.textureCache.clear(),
                a.geometryCache.forEach((e) => e.forEach((e) => e.dispose())),
                a.geometryCache.clear());
            }
            constructor(e, t, i, r = 1, s = !1, a = 0) {
              ((this.scale = r),
                (this.depth = s),
                (this.depthOffset = a),
                (this.batchPalettes = []),
                (this.useMeshBatching = !1),
                (this.opacity = 1),
                (this.forceTransparent = !1),
                (this.offset = { x: 0, y: 0 }),
                (this.frameOffset = 0),
                (this.flat = !1),
                (this.shpFile = e),
                (this.palette = t),
                (this.camera = i),
                (this.shpSize = { width: e.width, height: e.height }),
                this.setFrame(0));
            }
            useMaterial(e, t, i) {
              if (e.format !== THREE.AlphaFormat) throw new Error("Texture must have format THREE.AlphaFormat");
              this.materialCacheKey = e.uuid + "_" + t.uuid + "_" + Number(i);
              let r = a.materialCache.get(this.materialCacheKey),
                s;
              return (
                r
                  ? ((s = r.material), r.usages++)
                  : ((s = new c.PaletteBasicMaterial({
                      map: e,
                      palette: t,
                      alphaTest: 0.05,
                      paletteCount: this.batchPalettes.length,
                      flatShading: !0,
                      transparent: i,
                    })),
                    (r = { material: s, usages: 1 }),
                    a.materialCache.set(this.materialCacheKey, r)),
                s
              );
            }
            freeMaterial() {
              if (!this.materialCacheKey) throw new Error("Material cache key not set");
              let e = a.materialCache.get(this.materialCacheKey);
              e &&
                (1 === e.usages ? (a.materialCache.delete(this.materialCacheKey), e.material.dispose()) : e.usages--);
            }
            setBatched(e) {
              if (this.mesh) throw new Error("Batching can only be set before calling build()");
              this.useMeshBatching = e;
            }
            setOffset(e) {
              if (this.mesh) throw new Error("Offset can only be set before calling build()");
              this.offset = e;
            }
            setFrameOffset(e) {
              if (this.mesh) throw new Error("frameOffset can only be set before calling build()");
              this.frameOffset = e;
            }
            initTexture() {
              (a.prepareTexture(this.shpFile), (this.atlas = a.textureCache.get(this.shpFile)));
            }
            getSpriteGeometryOptions(e) {
              e += this.frameOffset;
              var t = this.shpFile.getImage(e),
                t = {
                  x: t.x - Math.floor(this.shpSize.width / 2) + Math.floor(this.offset.x),
                  y: t.y - Math.floor(this.shpSize.height / 2) + Math.floor(this.offset.y),
                };
              return {
                texture: this.atlas.getTexture(),
                textureArea: this.atlas.getTextureArea(e),
                flat: this.flat,
                align: { x: 1, y: -1 },
                offset: t,
                camera: this.camera,
                depth: this.depth,
                depthOffset: this.depthOffset,
                scale: this.scale,
              };
            }
            getGeometryCacheKey(e) {
              return (
                e +
                this.frameOffset +
                "_" +
                this.shpSize.width +
                "_" +
                this.shpSize.height +
                "_" +
                this.offset.x +
                "_" +
                this.offset.y +
                "_" +
                this.flat +
                "_" +
                this.depth +
                "_" +
                this.depthOffset
              );
            }
            setFrame(i) {
              if (this.frameNo !== i && ((this.frameNo = i), this.mesh)) {
                let e = this.getGeometryCache();
                var r = this.getGeometryCacheKey(i);
                let t = e.get(r);
                (t || ((t = l.SpriteUtils.createSpriteGeometry(this.getSpriteGeometryOptions(i))), e.set(r, t)),
                  (this.mesh.geometry = t));
              }
            }
            getGeometryCache() {
              let e = a.geometryCache.get(this.shpFile);
              return (e || ((e = new Map()), a.geometryCache.set(this.shpFile, e)), e);
            }
            getFrame() {
              return this.frameNo;
            }
            setSize(e) {
              this.shpSize = { width: e.width, height: e.height };
            }
            getSize() {
              return this.shpSize;
            }
            get frameCount() {
              return this.shpFile.numImages;
            }
            getBatchPaletteIndex(t) {
              var e = this.batchPalettes.findIndex((e) => e.hash === t.hash);
              if (-1 === e)
                throw new Error(
                  "Provided palette not found in the list of batch palettes. Call setBatchPalettes first.",
                );
              return e;
            }
            setPalette(t) {
              if (((this.palette = t), this.mesh))
                if (this.useMeshBatching) {
                  var i = this.getBatchPaletteIndex(t);
                  this.mesh.setPaletteIndex(i);
                } else {
                  i = o.TextureUtils.textureFromPalette(t);
                  let e = this.mesh.material;
                  e.palette = i;
                }
            }
            setBatchPalettes(e) {
              if (!this.useMeshBatching) throw new Error("Can't use multiple palettes when not batching");
              if (this.mesh) throw new Error("Palettes must be set before creating 3DObject");
              this.batchPalettes = e;
            }
            setExtraLight(t) {
              if (((this.extraLight = t), this.mesh))
                if (this.useMeshBatching) this.mesh.setExtraLight(t);
                else {
                  let e = this.mesh.material;
                  e.extraLight = t;
                }
            }
            setOpacity(e) {
              var t = this.opacity;
              (t !== e && ((this.opacity = e), this.updateOpacity()),
                Math.floor(t) === Math.floor(e) || this.forceTransparent || this.updateTransparency());
            }
            setForceTransparent(e) {
              e !== this.forceTransparent && ((this.forceTransparent = e), this.updateTransparency());
            }
            updateOpacity() {
              this.mesh &&
                (this.useMeshBatching
                  ? this.mesh.setOpacity(this.opacity)
                  : (this.mesh.material.opacity = this.opacity));
            }
            updateTransparency() {
              var e, t, i;
              this.mesh &&
                ((e = this.forceTransparent || this.opacity < 1),
                this.useMeshBatching
                  ? ((t = this.mesh.material.map),
                    (i = this.mesh.material.palette),
                    this.freeMaterial(),
                    (this.mesh.material = this.useMaterial(t, i, e)))
                  : (this.mesh.material.transparent = e));
            }
            build() {
              if (this.mesh) return this.mesh;
              this.initTexture();
              var e,
                t = this.atlas.getTexture(),
                i = this.getGeometryCacheKey(this.frameNo);
              let r = this.getGeometryCache(),
                s = r.get(i);
              s ||
                ((e = this.getSpriteGeometryOptions(this.frameNo)),
                (s = l.SpriteUtils.createSpriteGeometry(e)),
                r.set(i, s));
              let a;
              var n,
                i = this.opacity < 1 || this.forceTransparent;
              return (
                this.useMeshBatching
                  ? ((n = o.TextureUtils.textureFromPalettes(this.batchPalettes)),
                    (n = this.useMaterial(t, n, i)),
                    (a = new h.BatchedMesh(s, n, h.BatchMode.Merging)),
                    (a.castShadow = !1))
                  : ((n = o.TextureUtils.textureFromPalette(this.palette)),
                    (i = new c.PaletteBasicMaterial({
                      map: t,
                      palette: n,
                      alphaTest: 0.5,
                      flatShading: !0,
                      transparent: i,
                    })),
                    (a = new THREE.Mesh(s, i))),
                (a.matrixAutoUpdate = !1),
                (this.mesh = a),
                this.setPalette(this.palette),
                this.updateOpacity(),
                this.extraLight && this.setExtraLight(this.extraLight),
                a
              );
            }
            dispose() {
              this.mesh &&
                (this.useMeshBatching ? this.freeMaterial() : this.mesh.material.dispose(), (this.mesh = void 0));
            }
          }),
        ),
          (a.textureCache = new Map()),
          (a.geometryCache = new Map()),
          (a.materialCache = new Map()));
      },
    };
  },
);
