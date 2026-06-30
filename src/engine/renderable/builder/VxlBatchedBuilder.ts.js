// === Reconstructed SystemJS module: engine/renderable/builder/VxlBatchedBuilder ===
// deps: ["engine/gfx/TextureUtils","engine/gfx/batch/BatchedMesh","engine/renderable/builder/VxlBuilder","engine/gfx/material/PalettePhongMaterial"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/builder/VxlBatchedBuilder",
  [
    "engine/gfx/TextureUtils",
    "engine/gfx/batch/BatchedMesh",
    "engine/renderable/builder/VxlBuilder",
    "engine/gfx/material/PalettePhongMaterial",
  ],
  function (e, t) {
    "use strict";
    var i, c, r, s, a;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        ((a = class a extends r.VxlBuilder {
          constructor(e, t, i, r, s, a) {
            (super(a),
              (this.vxlFile = e),
              (this.hvaFile = t),
              (this.palettes = i),
              (this.palette = r),
              (this.vxlGeometryPool = s),
              (this.clippingPlanes = []),
              (this.opacity = 1),
              (this.castShadow = !0));
          }
          createVxlMeshes() {
            var e = i.TextureUtils.textureFromPalettes(this.palettes);
            let n = this.useMaterial(e);
            this.materialCacheKey = e;
            let o = this.getPaletteIndex(this.palette),
              t = this.vxlFile.sections,
              l = new Map();
            return (
              t.forEach((e, t) => {
                var i = this.vxlGeometryPool.get(e);
                let r = new c.BatchedMesh(i, n),
                  s = e.transfMatrix,
                  a = this.hvaFile?.sections[t];
                (a && (s = e.scaleHvaMatrix(a.getMatrix(0))),
                  r.applyMatrix(s),
                  l.set(e.name, r),
                  (r.castShadow = this.castShadow),
                  r.setPaletteIndex(o),
                  this.extraLight && r.setExtraLight(this.extraLight),
                  r.setOpacity(this.opacity),
                  r.setClippingPlanes(this.clippingPlanes));
              }),
              l
            );
          }
          useMaterial(e) {
            let t = a.materialCache.get(e),
              i;
            return (
              t
                ? ((i = t.material), t.usages++)
                : ((i = new s.PalettePhongMaterial({
                    palette: e,
                    paletteCount: this.palettes.length,
                    vertexColors: THREE.VertexColors,
                    transparent: !0,
                  })),
                  (t = { material: i, usages: 1 }),
                  a.materialCache.set(e, t)),
              i
            );
          }
          freeMaterial() {
            let e = a.materialCache.get(this.materialCacheKey);
            e && (1 === e.usages ? (a.materialCache.delete(this.materialCacheKey), e.material.dispose()) : e.usages--);
          }
          getPaletteIndex(t) {
            var e = this.palettes.findIndex((e) => e.hash === t.hash);
            if (-1 === e) throw new Error("Provided palette not found in the list of available palettes");
            return e;
          }
          setPalette(e) {
            if (((this.palette = e), this.object)) {
              let t = this.getPaletteIndex(e);
              this.sections.forEach((e) => e.setPaletteIndex(t));
            }
          }
          setExtraLight(t) {
            ((this.extraLight = t), this.object && this.sections.forEach((e) => e.setExtraLight(t)));
          }
          setShadow(t) {
            ((this.castShadow = t),
              this.sections?.forEach((e) => {
                e.castShadow = t;
              }));
          }
          setClippingPlanes(t) {
            ((this.clippingPlanes = t), this.object && this.sections.forEach((e) => e.setClippingPlanes(t)));
          }
          setOpacity(t) {
            ((this.opacity = t), this.object && this.sections.forEach((e) => e.setOpacity(t)));
          }
          dispose() {
            this.object && (this.freeMaterial(), (this.object = void 0));
          }
        }),
          e("VxlBatchedBuilder", a),
          (a.materialCache = new Map()));
      },
    };
  },
);
