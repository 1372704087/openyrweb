// === Reconstructed SystemJS module: engine/gfx/batch/BatchedMesh ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gfx/batch/BatchedMesh", [], function (t, e) {
  "use strict";
  var r, i;
  e && e.id;
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = r || t("BatchMode", (r = {})))[(e.Instancing = 0)] = "Instancing"),
        (e[(e.Merging = 1)] = "Merging"),
        (i = class extends THREE.Mesh {
          constructor(e, t, i = r.Instancing) {
            (super(e, t),
              (this.geometry = e),
              (this.material = t),
              (this.batchMode = i),
              (this.isBatchedMesh = !0),
              (this.castShadow = !1),
              (this.opacity = 1),
              (this.extraLight = new THREE.Vector3(0, 0, 0)),
              (this.paletteIndex = 0),
              (this.clippingPlanes = []),
              (this.clippingPlanesHash = ""),
              this.layers.disable(0));
          }
          getOpacity() {
            return this.opacity;
          }
          setOpacity(e) {
            this.opacity = e;
          }
          getExtraLight() {
            return this.extraLight;
          }
          setExtraLight(e) {
            this.extraLight = e;
          }
          getPaletteIndex() {
            return this.paletteIndex;
          }
          setPaletteIndex(e) {
            this.paletteIndex = e;
          }
          getClippingPlanes() {
            return this.clippingPlanes;
          }
          setClippingPlanes(e) {
            ((this.clippingPlanes = e), this.updateClippingPlanesHash(e));
          }
          updateClippingPlanesHash(e) {
            this.clippingPlanesHash = e
              .map((e) => [...e.normal.toArray(), e.constant])
              .flat()
              .join(",");
          }
          getClippingPlanesHash() {
            return this.clippingPlanesHash;
          }
        }),
        t("BatchedMesh", i));
    },
  };
});
