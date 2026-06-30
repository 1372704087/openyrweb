// === Reconstructed SystemJS module: engine/renderable/builder/VxlNonBatchedBuilder ===
// deps: ["engine/gfx/TextureUtils","engine/renderable/builder/VxlBuilder","engine/gfx/material/PalettePhongMaterial"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/builder/VxlNonBatchedBuilder",
  ["engine/gfx/TextureUtils", "engine/renderable/builder/VxlBuilder", "engine/gfx/material/PalettePhongMaterial"],
  function (e, t) {
    "use strict";
    var i, r, s, a;
    t && t.id;
    return {
      setters: [
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
        function (e) {
          s = e;
        },
      ],
      execute: function () {
        ((a = class extends r.VxlBuilder {
          constructor(e, t, i, r, s) {
            (super(s),
              (this.vxlFile = e),
              (this.hvaFile = t),
              (this.palette = i),
              (this.vxlGeometryPool = r),
              (this.clippingPlanes = []),
              (this.castShadow = !0));
          }
          createVxlMeshes() {
            var e = this.palette,
              e = i.TextureUtils.textureFromPalette(e);
            let n = (this.material = new s.PalettePhongMaterial({ palette: e, vertexColors: THREE.VertexColors }));
            (this.extraLight && (n.extraLight = this.extraLight), (n.clippingPlanes = this.clippingPlanes));
            let t = this.vxlFile.sections,
              o = new Map();
            return (
              t.forEach((e, t) => {
                var i = this.vxlGeometryPool.get(e);
                let r = new THREE.Mesh(i, n),
                  s = e.transfMatrix,
                  a = this.hvaFile?.sections[t];
                (a && (s = e.scaleHvaMatrix(a.getMatrix(0))),
                  r.applyMatrix(s),
                  o.set(e.name, r),
                  (r.castShadow = this.castShadow));
              }),
              o
            );
          }
          setPalette(e) {
            var t;
            ((this.palette = e),
              this.object && ((t = i.TextureUtils.textureFromPalette(e)), (this.material.palette = t)));
          }
          setExtraLight(e) {
            ((this.extraLight = e), this.object && (this.material.extraLight = e));
          }
          setShadow(t) {
            ((this.castShadow = t), this.sections?.forEach((e) => (e.castShadow = t)));
          }
          setClippingPlanes(e) {
            ((this.clippingPlanes = e), this.object && (this.material.clippingPlanes = e));
          }
          setOpacity(e) {
            ((this.material.transparent = e < 1), (this.material.opacity = e));
          }
          dispose() {
            this.object && this.material.dispose();
          }
        }),
          e("VxlNonBatchedBuilder", a));
      },
    };
  },
);
