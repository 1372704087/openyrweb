// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/keyboard/command/GoToCameraLocationCmd ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/game/worldInteraction/keyboard/command/GoToCameraLocationCmd", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "GoToCameraLocationCmd",
        (i = class {
          constructor(e, t, i, r) {
            ((this.cameraPan = e), (this.cameraLocations = t), (this.idx = i), (this.defaultLocation = r));
          }
          execute() {
            var e = this.cameraLocations.get(this.idx) || this.defaultLocation;
            e && this.cameraPan.setPan(e);
          }
        }),
      );
    },
  };
});
