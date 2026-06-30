// === Reconstructed SystemJS module: engine/renderable/WithPosition ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/WithPosition", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "WithPosition",
        (i = class {
          constructor() {
            ((this.matrixUpdate = !1), (this.position = new THREE.Vector3()));
          }
          setPosition(e, t, i) {
            ((this.position.x = e), (this.position.y = t), (this.position.z = i), this.updatePosition());
          }
          getPosition() {
            return this.position;
          }
          updatePosition() {
            if (this.target) {
              let e = this.target.get3DObject();
              e &&
                (e.position.set(this.position.x, this.position.y, this.position.z),
                this.matrixUpdate && (e.matrix.setPosition(e.position), (e.matrixWorldNeedsUpdate = !0)));
            }
          }
          applyTo(e) {
            ((this.target = e), this.updatePosition());
          }
        }),
      );
    },
  };
});
