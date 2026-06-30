// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/keyboard/command/SelectGroupCmd ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/game/worldInteraction/keyboard/command/SelectGroupCmd", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "SelectGroupCmd",
        (i = class {
          constructor(e, t, i, r, s) {
            ((this.groupNum = e),
              (this.unitSelectionHandler = t),
              (this.targetLines = i),
              (this.mapPanningHelper = r),
              (this.cameraPan = s));
          }
          execute() {
            (this.unitSelectionHandler.selectGroup(this.groupNum), this.targetLines.forceShow());
            var e = performance.now();
            let t = !0;
            ((!this.lastSelectTime || 400 < e - this.lastSelectTime) && ((t = !1), (this.lastSelectTime = e)),
              !t ||
                ((e = this.unitSelectionHandler.getSelectedUnits()).length &&
                  ((e = this.computePanTile(e)),
                  (e = this.mapPanningHelper.computeCameraPanFromTile(e.rx, e.ry)),
                  this.cameraPan.setPan(e))));
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
