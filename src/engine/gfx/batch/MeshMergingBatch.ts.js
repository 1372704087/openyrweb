// === Reconstructed SystemJS module: engine/gfx/batch/MeshMergingBatch ===
// deps: ["engine/gfx/batch/MergedSpriteMesh"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gfx/batch/MeshMergingBatch", ["engine/gfx/batch/MergedSpriteMesh"], function (e, t) {
  "use strict";
  var i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      e(
        "MeshMergingBatch",
        (r = class {
          get castShadow() {
            return this._castShadow;
          }
          set castShadow(e) {
            ((this._castShadow = e), this.mergedGeoMesh && (this.mergedGeoMesh.castShadow = e));
          }
          get receiveShadow() {
            return this._receiveShadow;
          }
          set receiveShadow(e) {
            ((this._receiveShadow = e), this.mergedGeoMesh && (this.mergedGeoMesh.receiveShadow = e));
          }
          get clippingPlanes() {
            return this._clippingPlanes;
          }
          set clippingPlanes(e) {
            ((this._clippingPlanes = e), this.mergedGeoMesh && (this.mergedGeoMesh.material.clippingPlanes = e));
          }
          get renderOrder() {
            return this._renderOrder;
          }
          set renderOrder(e) {
            ((this._renderOrder = e), this.mergedGeoMesh && (this.mergedGeoMesh.renderOrder = e));
          }
          constructor(e) {
            ((this.maxInstances = e),
              (this._castShadow = !1),
              (this._receiveShadow = !1),
              (this._clippingPlanes = []),
              (this._renderOrder = 0));
          }
          get3DObject() {
            return this.target;
          }
          create3DObject() {
            if (!this.target) {
              let e = new THREE.Object3D();
              ((e.matrixAutoUpdate = !1), (this.target = e), this.mergedGeoMesh && e.add(this.mergedGeoMesh));
            }
          }
          setMeshes(e) {
            if (e.length > this.maxInstances) throw new RangeError("Meshes array exceeds max number of instances");
            e.length
              ? (this.mergedGeoMesh ||
                  ((this.mergedGeoMesh = new i.MergedSpriteMesh(e[0].geometry, e[0].material, this.maxInstances)),
                  (this.mergedGeoMesh.castShadow = this._castShadow),
                  (this.mergedGeoMesh.receiveShadow = this._receiveShadow),
                  (this.mergedGeoMesh.renderOrder = this._renderOrder),
                  (this.mergedGeoMesh.material.clippingPlanes = this._clippingPlanes),
                  this.target?.add(this.mergedGeoMesh)),
                this.mergedGeoMesh.updateFromMeshes(e))
              : this.mergedGeoMesh &&
                (this.target?.remove(this.mergedGeoMesh), this.mergedGeoMesh.dispose(), (this.mergedGeoMesh = void 0));
          }
          update() {}
          dispose() {
            this.mergedGeoMesh?.dispose();
          }
        }),
      );
    },
  };
});
