// === Reconstructed SystemJS module: engine/IsoCoords ===
// deps: ["game/Coords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/IsoCoords", ["game/Coords"], function (e, t) {
  "use strict";
  var r, s;
  t && t.id;
  return {
    setters: [
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      e(
        "IsoCoords",
        (s = class s {
          static init(e) {
            s.worldOrigin = e;
          }
          static worldToScreen(e, t) {
            if (!s.worldOrigin) throw new Error("Coords not initialized with world origin");
            return (
              (e -= s.worldOrigin.x),
              (t -= s.worldOrigin.y),
              { x: (e /= r.Coords.ISO_WORLD_SCALE) - (t /= r.Coords.ISO_WORLD_SCALE), y: (e + t) / 2 }
            );
          }
          static screenToWorld(e, t) {
            if (!s.worldOrigin) throw new Error("Coords not initialized with world origin");
            return {
              x: ((e + 2 * t) / 2) * r.Coords.ISO_WORLD_SCALE + s.worldOrigin.x,
              y: ((2 * t - e) / 2) * r.Coords.ISO_WORLD_SCALE + s.worldOrigin.y,
            };
          }
          static vecWorldToScreen(e) {
            let t = s.worldToScreen(e.x, e.z);
            return ((t.y -= s.tileHeightToScreen(r.Coords.worldToTileHeight(e.y))), t);
          }
          static tileToScreen(e, t) {
            var i = r.Coords.tileToWorld(e, t);
            return s.worldToScreen(i.x, i.y);
          }
          static tileHeightToScreen(e) {
            return e * (r.Coords.ISO_TILE_SIZE / 2);
          }
          static tile3dToScreen(e, t, i) {
            let r = s.tileToScreen(e, t);
            return ((r.y -= s.tileHeightToScreen(i)), r);
          }
          static screenTileToScreen(e, t) {
            return { x: e * r.Coords.ISO_TILE_SIZE, y: (t * r.Coords.ISO_TILE_SIZE) / 2 };
          }
          static screenToScreenTile(e, t) {
            return { x: e / r.Coords.ISO_TILE_SIZE, y: t / (r.Coords.ISO_TILE_SIZE / 2) };
          }
          static screenTileToWorld(e, t) {
            var i = s.screenTileToScreen(e, t);
            return s.screenToWorld(i.x, i.y);
          }
          static getScreenTileSize() {
            return {
              width: s.tileToScreen(1, 0).x - s.tileToScreen(0, 1).x,
              height: s.tileToScreen(1, 1).y - s.tileToScreen(0, 0).y,
            };
          }
          static screenDistanceToWorld(e, t) {
            return r.Coords.screenDistanceToWorld(e, t);
          }
        }),
      );
    },
  };
});
