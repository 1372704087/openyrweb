// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/keyboard/command/CenterGroupCmd ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/game/worldInteraction/keyboard/command/CenterGroupCmd", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "CenterGroupCmd",
        (i = class {
          constructor(e, t, i, r) {
            ((this.groupNum = e), (this.unitSelectionHandler = t), (this.mapPanningHelper = i), (this.cameraPan = r));
          }
          execute() {
            this.unitSelectionHandler.selectGroup(this.groupNum);
            var e = this.unitSelectionHandler.getGroupUnits(this.groupNum);
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
