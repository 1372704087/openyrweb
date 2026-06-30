// === Reconstructed SystemJS module: engine/renderable/builder/VxlBuilder ===
// deps: ["game/Coords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/builder/VxlBuilder", ["game/Coords"], function (e, t) {
  "use strict";
  var s, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        s = e;
      },
    ],
    execute: function () {
      e(
        "VxlBuilder",
        (i = class {
          constructor(e) {
            this.camera = e;
          }
          build() {
            if (this.object) return this.object;
            let e = (this.object = new THREE.Object3D()),
              i = Math.cos(this.camera.rotation.y) * s.Coords.ISO_WORLD_SCALE;
            e.scale.set(i, i, i);
            let r = new THREE.Object3D();
            ((r.rotation.x = -Math.PI / 2),
              (r.rotation.z = +Math.PI / 2),
              (r.matrixAutoUpdate = !1),
              r.updateMatrix(),
              e.add(r));
            let t = (this.sections = this.createVxlMeshes());
            return (
              t.forEach((e) => {
                var t;
                ((e.matrixAutoUpdate = !1),
                  r.add(e),
                  this.localBoundingBox ||
                    (e.geometry.boundingBox || e.geometry.computeBoundingBox(),
                    (this.localBoundingBox = new THREE.Box3(
                      e.geometry.boundingBox.min.clone().multiplyScalar(i),
                      e.geometry.boundingBox.max.clone().multiplyScalar(i),
                    )),
                    (t = this.localBoundingBox.min.x),
                    (this.localBoundingBox.min.x = this.localBoundingBox.min.y),
                    (this.localBoundingBox.min.y = t),
                    (t = this.localBoundingBox.max.x),
                    (this.localBoundingBox.max.x = this.localBoundingBox.max.y),
                    (this.localBoundingBox.max.y = t)));
              }),
              (e.matrixAutoUpdate = !1),
              e.updateMatrix(),
              e
            );
          }
          getSection(e) {
            if (!this.sections) throw new Error("Vxl object must be built first");
            return this.sections.get(e);
          }
          getLocalBoundingBox() {
            return this.localBoundingBox;
          }
        }),
      );
    },
  };
});
