// === Reconstructed SystemJS module: tools/CameraZoomControls ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("tools/CameraZoomControls", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "CameraZoomControls",
        (i = class {
          constructor(e, t) {
            ((this.pointerEvents = e),
              (this.cameraZoom = t),
              (this.handleWheel = (e) => {
                this.cameraZoom.applyStep(0 < e.wheelDeltaY ? -0.1 : 0.1);
              }));
          }
          init() {
            this.pointerEvents.addEventListener("canvas", "wheel", this.handleWheel);
          }
          destroy() {
            this.pointerEvents.removeEventListener("canvas", "wheel", this.handleWheel);
          }
        }),
      );
    },
  };
});
