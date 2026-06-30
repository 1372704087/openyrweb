// === Reconstructed SystemJS module: engine/util/RaycastHelper ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/util/RaycastHelper", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "RaycastHelper",
        (i = class {
          constructor(e) {
            this.scene = e;
          }
          intersect(e, t, i = !1) {
            let r = new THREE.Raycaster();
            var s = this.normalizePointer(e, this.scene.viewport);
            return (r.setFromCamera(s, this.scene.camera), r.intersectObjects(t, i));
          }
          normalizePointer(e, t) {
            return { x: ((e.x - t.x) / t.width) * 2 - 1, y: 2 * -((e.y - t.y) / t.height) + 1 };
          }
        }),
      );
    },
  };
});
