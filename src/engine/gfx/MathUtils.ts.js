// === Reconstructed SystemJS module: engine/gfx/MathUtils ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gfx/MathUtils", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "MathUtils",
        (i = class {
          static rotateObjectAboutPoint(e, t, i, r, s = !1) {
            ((s = void 0 !== s && s) && e.parent.localToWorld(e.position),
              e.position.sub(t),
              e.position.applyAxisAngle(i, r),
              e.position.add(t),
              s && e.parent.worldToLocal(e.position),
              e.rotateOnAxis(i, r));
          }
          static translateTowardsCamera(e, t, i) {
            var r = new THREE.Quaternion().setFromEuler(t.rotation);
            (e.setRotationFromQuaternion(r),
              e.translateZ(i * Math.cos(t.rotation.y)),
              e.setRotationFromEuler(new THREE.Euler(0, 0, 0)));
          }
        }),
      );
    },
  };
});
