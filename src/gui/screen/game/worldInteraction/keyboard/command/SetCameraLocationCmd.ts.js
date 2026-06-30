// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/keyboard/command/SetCameraLocationCmd ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/game/worldInteraction/keyboard/command/SetCameraLocationCmd", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "SetCameraLocationCmd",
        (i = class {
          constructor(e, t, i) {
            ((this.cameraPan = e), (this.cameraLocations = t), (this.idx = i));
          }
          execute() {
            this.cameraLocations.set(this.idx, this.cameraPan.getPan());
          }
        }),
      );
    },
  };
});
