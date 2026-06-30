// === Reconstructed SystemJS module: engine/renderable/CameraZoom ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/CameraZoom", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "CameraZoom",
        (i = class {
          constructor(e) {
            ((this.freeCamera = e), (this.zoom = 1));
          }
          getZoom() {
            return this.zoom;
          }
          applyStep(e) {
            this.freeCamera.value && (this.zoom = Math.max(0.1, this.zoom + e));
          }
        }),
      );
    },
  };
});
