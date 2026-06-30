// === Reconstructed SystemJS module: engine/renderable/entity/BoxIntersectObject3D ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/entity/BoxIntersectObject3D", [], function (e, t) {
  "use strict";
  var s, a, n, o, i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      ((s = new THREE.Ray()),
        (a = new THREE.Matrix4()),
        (n = new THREE.Box3()),
        (o = new THREE.Vector3()),
        (i = class extends THREE.Object3D {
          constructor(e) {
            (super(), (this.boxSize = e));
          }
          raycast(t, i) {
            if (this.parent) {
              (a.getInverse(this.parent.matrixWorld), s.copy(t.ray).applyMatrix4(a), o.copy(this.position));
              let e = n.setFromCenterAndSize(o, this.boxSize);
              if (s.intersectsBox(e)) {
                const r = new THREE.Vector3();
                (e.getCenter(r),
                  r.applyMatrix4(this.parent.matrixWorld),
                  i.push({ distance: t.ray.origin.distanceTo(r), point: r, object: this }));
              }
            }
          }
        }),
        e("BoxIntersectObject3D", i));
    },
  };
});
