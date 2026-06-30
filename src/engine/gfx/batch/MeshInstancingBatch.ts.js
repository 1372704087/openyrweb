// === Reconstructed SystemJS module: engine/gfx/batch/MeshInstancingBatch ===
// deps: ["engine/gfx/batch/InstancedMesh"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gfx/batch/MeshInstancingBatch", ["engine/gfx/batch/InstancedMesh"], function (e, t) {
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
        "MeshInstancingBatch",
        (r = class {
          get castShadow() {
            return this._castShadow;
          }
          set castShadow(e) {
            ((this._castShadow = e), this.instancedMesh && (this.instancedMesh.castShadow = e));
          }
          get receiveShadow() {
            return this._receiveShadow;
          }
          set receiveShadow(e) {
            ((this._receiveShadow = e), this.instancedMesh && (this.instancedMesh.receiveShadow = e));
          }
          get clippingPlanes() {
            return this._clippingPlanes;
          }
          set clippingPlanes(e) {
            ((this._clippingPlanes = e), this.instancedMesh && (this.instancedMesh.material.clippingPlanes = e));
          }
          get renderOrder() {
            return this._renderOrder;
          }
          set renderOrder(e) {
            ((this._renderOrder = e), this.instancedMesh && (this.instancedMesh.renderOrder = e));
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
              ((e.matrixAutoUpdate = !1), (this.target = e), this.instancedMesh && e.add(this.instancedMesh));
            }
          }
          setMeshes(e) {
            if (e.length > this.maxInstances) throw new RangeError("Meshes array exceeds max number of instances");
            var t;
            e.length
              ? ((t = !!e[0].material.palette),
                this.instancedMesh ||
                  ((this.instancedMesh = new i.InstancedMesh(e[0].geometry, e[0].material, this.maxInstances, !0)),
                  (this.instancedMesh.castShadow = this._castShadow),
                  (this.instancedMesh.renderOrder = this._renderOrder),
                  (this.instancedMesh.material.clippingPlanes = this._clippingPlanes),
                  t &&
                    (this.instancedMesh.geometry.addAttribute(
                      "instancePaletteOffset",
                      new THREE.InstancedBufferAttribute(new Float32Array(this.maxInstances), 1),
                    ),
                    this.instancedMesh.geometry.addAttribute(
                      "instanceExtraLight",
                      new THREE.InstancedBufferAttribute(new Float32Array(3 * this.maxInstances), 3),
                    )),
                  this.target?.add(this.instancedMesh)),
                this.instancedMesh.updateFromMeshes(e))
              : this.instancedMesh &&
                (this.target?.remove(this.instancedMesh), this.instancedMesh.dispose(), (this.instancedMesh = void 0));
          }
          update() {}
          dispose() {
            this.instancedMesh?.dispose();
          }
        }),
      );
    },
  };
});
