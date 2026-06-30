// === Reconstructed SystemJS module: game/Target ===
// deps: ["game/Coords","game/type/LandType"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/Target", ["game/Coords", "game/type/LandType"], function (e, t) {
  "use strict";
  var i, r, s;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      e(
        "Target",
        (s = class {
          constructor(e, t, i) {
            ((this.tileOccupation = i),
              (this.isOre = !1),
              e
                ? e.isOverlay() && e.isBridge()
                  ? ((this.bridge = e), (this.tile = t))
                  : e.isOverlay() && e.isTiberium()
                    ? ((this.isOre = !0), (this.tile = e.tile))
                    : ((this.obj = e), (this.tile = e.isBuilding() ? e.centerTile : e.tile))
                : (t.landType === r.LandType.Tiberium && (this.isOre = !0), (this.tile = t)));
          }
          equals(e) {
            return this.obj === e.obj && this.tile === e.tile && this.bridge === e.bridge && this.isOre === e.isOre;
          }
          getWorldCoords() {
            return this.obj
              ? this.obj.position.worldPosition
              : i.Coords.tile3dToWorld(
                  this.tile.rx + 0.5,
                  this.tile.ry + 0.5,
                  this.tile.z + (this.bridge?.tileElevation ?? 0),
                );
          }
          isBridge() {
            return !this.obj && !!this.bridge;
          }
          getBridge() {
            return (
              this.bridge ||
              (this.obj?.isUnit() && this.obj.onBridge ? this.tileOccupation.getBridgeOnTile(this.obj.tile) : void 0)
            );
          }
        }),
      );
    },
  };
});
