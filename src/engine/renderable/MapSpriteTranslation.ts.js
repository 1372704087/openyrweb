// === Reconstructed SystemJS module: engine/renderable/MapSpriteTranslation ===
// deps: ["game/Coords","engine/IsoCoords"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/renderable/MapSpriteTranslation", ["game/Coords", "engine/IsoCoords"], function (e, t) {
  "use strict";
  var s, a, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        s = e;
      },
      function (e) {
        a = e;
      },
    ],
    execute: function () {
      e(
        "MapSpriteTranslation",
        (i = class {
          constructor(e, t) {
            ((this.rx = e), (this.ry = t));
          }
          compute() {
            let e = s.Coords.tileToWorld(this.rx, this.ry);
            var t = a.IsoCoords.worldToScreen(e.x, e.y),
              i = a.IsoCoords.worldToScreen(0, 0);
            let r = new THREE.Vector2(i.x - t.x, i.y - t.y);
            t = r.y - Math.floor(r.y);
            return (
              0 != t &&
                ((r.y -= t), (i = new THREE.Vector2(i.x - r.x, i.y - r.y)), (e = a.IsoCoords.screenToWorld(i.x, i.y))),
              { spriteOffset: r, anchorPointWorld: e }
            );
          }
        }),
      );
    },
  };
});
