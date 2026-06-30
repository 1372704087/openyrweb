// === Reconstructed SystemJS module: engine/renderable/DebugRenderable ===
// deps: ["data/Palette","engine/gfx/DebugUtils","engine/gfx/TextureUtils","engine/gfx/material/PaletteBasicMaterial","three","engine/gfx/batch/BatchedMesh"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/DebugRenderable",
  [
    "data/Palette",
    "engine/gfx/DebugUtils",
    "engine/gfx/TextureUtils",
    "engine/gfx/material/PaletteBasicMaterial",
    "three",
    "engine/gfx/batch/BatchedMesh",
  ],
  function (e, t) {
    "use strict";
    var i, n, o, l, c, h, u;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
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
        function (e) {
          h = e;
        },
      ],
      execute: function () {
        (e(
          "DebugRenderable",
          (u = class u {
            static getOrCreateTexture() {
              let e = u.checkerboardTex;
              return (
                e ||
                  ((e = n.DebugUtils.createIndexedCheckerTex(i.Palette.REMAP_START_IDX - 1, i.Palette.REMAP_START_IDX)),
                  (u.checkerboardTex = e)),
                e
              );
            }
            static clearCaches() {
              (u.checkerboardTex?.dispose(), u.geometryCache.forEach((e) => e.dispose()), u.geometryCache.clear());
            }
            constructor(e, t, i, r) {
              ((this.foundation = e),
                (this.height = t),
                (this.palette = i),
                (this.options = r),
                (this.batchPalettes = []),
                (this.useMeshBatching = !1),
                (this.opacity = 1));
            }
            useMaterial(e) {
              this.materialCacheKey = e.uuid;
              let t = u.materialCache.get(this.materialCacheKey),
                i;
              return (
                t
                  ? ((i = t.material), t.usages++)
                  : ((i = new l.PaletteBasicMaterial({
                      map: u.getOrCreateTexture(),
                      palette: e,
                      alphaTest: 0.05,
                      paletteCount: this.batchPalettes.length,
                      flatShading: !0,
                      transparent: !0,
                    })),
                    (t = { material: i, usages: 1 }),
                    u.materialCache.set(this.materialCacheKey, t)),
                i
              );
            }
            freeMaterial() {
              if (!this.materialCacheKey) throw new Error("Material cache key not set");
              let e = u.materialCache.get(this.materialCacheKey);
              e &&
                (1 === e.usages ? (u.materialCache.delete(this.materialCacheKey), e.material.dispose()) : e.usages--);
            }
            getGeometryCacheKey() {
              return this.foundation.width + "_" + this.foundation.height + "_" + this.height;
            }
            setBatched(e) {
              if (this.mesh) throw new Error("Batching can only be set before calling build()");
              this.useMeshBatching = e;
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
            setOpacity(e) {
              this.opacity !== e && ((this.opacity = e), this.updateOpacity());
            }
            updateOpacity() {
              this.mesh &&
                (this.useMeshBatching
                  ? this.mesh.setOpacity(this.opacity)
                  : (this.mesh.material.opacity = this.opacity));
            }
            create3DObject() {
              if (!this.mesh) {
                var r,
                  s,
                  a = this.getGeometryCacheKey();
                let e = u.geometryCache,
                  t = e.get(a);
                t ||
                  ((t = n.DebugUtils.createBoxGeometry(this.foundation, this.height, this.options?.centerFoundation)),
                  e.set(a, t));
                let i;
                (this.useMeshBatching
                  ? ((r = o.TextureUtils.textureFromPalettes(this.batchPalettes)),
                    (s = this.useMaterial(r)),
                    (i = new h.BatchedMesh(t, s, h.BatchMode.Merging)),
                    (i.castShadow = !1))
                  : ((r = o.TextureUtils.textureFromPalette(this.palette)),
                    (s = u.getOrCreateTexture()),
                    (s = new l.PaletteBasicMaterial({ palette: r, map: s, alphaTest: 0.05, transparent: !0 })),
                    (i = new c.Mesh(t, s))),
                  (i.matrixAutoUpdate = !1),
                  (this.mesh = i),
                  this.setPalette(this.palette),
                  this.updateOpacity());
              }
            }
            get3DObject() {
              return this.mesh;
            }
            update(e) {}
            dispose() {
              this.mesh &&
                (this.useMeshBatching ? this.freeMaterial() : this.mesh.material.dispose(), (this.mesh = void 0));
            }
          }),
        ),
          (u.geometryCache = new Map()),
          (u.materialCache = new Map()));
      },
    };
  },
);
