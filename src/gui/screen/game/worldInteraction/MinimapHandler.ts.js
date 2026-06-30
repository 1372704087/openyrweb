// === Reconstructed SystemJS module: gui/screen/game/worldInteraction/MinimapHandler ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("gui/screen/game/worldInteraction/MinimapHandler", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "MinimapHandler",
        (i = class {
          constructor(e, t, i, r, s) {
            ((this.minimap = e), (this.map = t), (this.shroud = i), (this.worldScene = r), (this.mapPanningHelper = s));
          }
          setShroud(e) {
            this.shroud = e;
          }
          panToTile(e) {
            this.worldScene.cameraPan.setPan(this.mapPanningHelper.computeCameraPanFromTile(e.rx, e.ry));
          }
          getHover(e) {
            return {
              entity: void 0,
              gameObject: this.shroud?.isShrouded(e)
                ? void 0
                : this.map
                    .getObjectsOnTile(e)
                    .sort((e, t) => Number(e.isTechno()) - Number(t.isTechno()))
                    .shift(),
              tile: e,
            };
          }
        }),
      );
    },
  };
});
