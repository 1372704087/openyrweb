// === Reconstructed SystemJS module: game/gameobject/unit/FacingUtil ===
// deps: ["game/math/Vector2","game/math/geometry"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/gameobject/unit/FacingUtil", ["game/math/Vector2", "game/math/geometry"], function (e, t) {
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
        "FacingUtil",
        (s = class s {
          static tick(e, t, i) {
            if (e === t) return { facing: e, delta: 0 };
            var r = (e - t + 360) % 360,
              s = (t - e + 360) % 360;
            if (Math.min(r, s) < i) return { facing: t, delta: 0 };
            r = (s <= r ? 1 : -1) * i;
            return { facing: (e + r + 360) % 360, delta: r };
          }
          static fromMapCoords(e) {
            return (-r.angleDegFromVec2(e) - 90 + 720) % 360;
          }
          static toMapCoords(e) {
            return r.rotateVec2(new i.Vector2(1e3, 0), s.toWorldDeg(e)).round().normalize();
          }
          static toWorldDeg(e) {
            return -(e + 90);
          }
        }),
      );
    },
  };
});
