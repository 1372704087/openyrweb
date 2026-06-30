// === Reconstructed SystemJS module: engine/renderable/CameraPan ===
// deps: ["util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/CameraPan", ["util/math"], function (e, t) {
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
        "CameraPan",
        (r = class {
          constructor(e) {
            ((this.freeCamera = e), (this.pan = { x: 0, y: 0 }));
          }
          setPanLimits(e) {
            ((this.panLimits = e), this.setPan({ x: this.pan.x, y: this.pan.y }));
          }
          getPanLimits() {
            return { ...this.panLimits };
          }
          getPan() {
            return { ...this.pan };
          }
          setPan(e) {
            (this.panLimits &&
              !this.freeCamera.value &&
              ((e.x = i.clamp(e.x, this.panLimits.x, this.panLimits.x + this.panLimits.width)),
              (e.y = i.clamp(e.y, this.panLimits.y, this.panLimits.y + this.panLimits.height))),
              (this.pan = { x: e.x, y: e.y }));
          }
        }),
      );
    },
  };
});
