// === Reconstructed SystemJS module: engine/util/MapPanningHelper ===
// deps: ["engine/IsoCoords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/util/MapPanningHelper", ["engine/IsoCoords"], function (e, t) {
  "use strict";
  var r, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      e(
        "MapPanningHelper",
        (i = class {
          constructor(e) {
            this.map = e;
          }
          computeCameraPanFromTile(e, t) {
            var i = this.map.tiles.getByMapCoords(e, t) ?? this.map.tiles.getPlaceholderTile(e, t),
              i = r.IsoCoords.tile3dToScreen(e + 0.5, t + 0.5, i.z);
            return this.computeCameraPanFromScreen(i);
          }
          computeCameraPanFromWorld(e) {
            var t = r.IsoCoords.vecWorldToScreen(e);
            return this.computeCameraPanFromScreen(t);
          }
          computeCameraPanFromScreen(e) {
            var t = this.getScreenPanOrigin();
            return { x: Math.floor(e.x - t.x), y: Math.floor(e.y - t.y) };
          }
          getScreenPanOrigin() {
            return r.IsoCoords.worldToScreen(0, 0);
          }
          computeCameraPanLimits(e, t) {
            var i = this.getScreenPanOrigin();
            return {
              x: Math.ceil(t.x - i.x + e.width / 2),
              y: Math.ceil(t.y - i.y + e.height / 2 - 1),
              width: t.width - e.width - 1,
              height: t.height - e.height - 1,
            };
          }
        }),
      );
    },
  };
});
