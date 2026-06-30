// === Reconstructed SystemJS module: game/Coords ===
// deps: ["game/math/GameMath","game/math/Vector2","game/math/Vector3"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/Coords", ["game/math/GameMath", "game/math/Vector2", "game/math/Vector3"], function (e, t) {
  "use strict";
  var i, r, a, n;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
      function (e) {
        r = e;
      },
      function (e) {
        a = e;
      },
    ],
    execute: function () {
      (e(
        "Coords",
        (n = class n {
          static tileToWorld(e, t) {
            return { x: e * n.LEPTONS_PER_TILE, y: t * n.LEPTONS_PER_TILE };
          }
          static vecWorldToGround(e) {
            return new r.Vector2(e.x, e.z);
          }
          static vecGroundToWorld(e) {
            return new a.Vector3(e.x, 0, e.y);
          }
          static tileHeightToWorld(e) {
            return e * (n.LEPTONS_PER_TILE / 2) * n.zScale;
          }
          static worldToTileHeight(e) {
            return e / ((n.LEPTONS_PER_TILE / 2) * n.zScale);
          }
          static tile3dToWorld(e, t, i) {
            var r = n.tileToWorld(e, t),
              s = n.tileHeightToWorld(i);
            return new a.Vector3(r.x, s, r.y);
          }
          static screenDistanceToWorld(e, t) {
            return {
              x: Math.floor(((e + 2 * t) / 2) * n.ISO_WORLD_SCALE),
              y: Math.floor(((2 * t - e) / 2) * n.ISO_WORLD_SCALE),
            };
          }
          static getWorldTileSize() {
            return n.LEPTONS_PER_TILE;
          }
        }),
      ),
        (n.ISO_TILE_SIZE = 30),
        (n.LEPTONS_PER_TILE = 256),
        (n.ISO_WORLD_SCALE = n.LEPTONS_PER_TILE / n.ISO_TILE_SIZE),
        (n.ISO_CAMERA_ALPHA = Math.PI / 6),
        (n.ISO_CAMERA_BETA = Math.PI / 4),
        (n.COS_ISO_CAMERA_BETA = i.GameMath.cos(n.ISO_CAMERA_BETA)),
        (n.zScale = n.COS_ISO_CAMERA_BETA / i.GameMath.cos(n.ISO_CAMERA_ALPHA)));
    },
  };
});
