// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/keyboard/command/CenterViewCmd ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/game/worldInteraction/keyboard/command/CenterViewCmd", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "CenterViewCmd",
        (i = class {
          constructor(e, t, i) {
            ((this.unitSelectionHandler = e), (this.mapPanningHelper = t), (this.cameraPan = i));
          }
          execute() {
            var e = this.unitSelectionHandler.getSelectedUnits();
            e.length &&
              ((e = this.computePanTile(e)),
              (e = this.mapPanningHelper.computeCameraPanFromTile(e.rx, e.ry)),
              this.cameraPan.setPan(e));
          }
          computePanTile(e) {
            return {
              rx: Math.floor(e.reduce((e, t) => e + t.tile.rx, 0) / e.length),
              ry: Math.floor(e.reduce((e, t) => e + t.tile.ry, 0) / e.length),
            };
          }
        }),
      );
    },
  };
});
