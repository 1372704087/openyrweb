// === Reconstructed SystemJS module: game/gameobject/unit/TargetUtil ===
// deps: ["game/math/Vector3","game/math/geometry","game/math/GameMath"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/gameobject/unit/TargetUtil",
  ["game/math/Vector3", "game/math/geometry", "game/math/GameMath"],
  function (e, t) {
    "use strict";
    var l, n, c, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          l = e;
        },
        function (e) {
          n = e;
        },
        function (e) {
          c = e;
        },
      ],
      execute: function () {
        e(
          "TargetUtil",
          (i = class {
            static computeInterceptPoint(e, t, i, r) {
              let s = e.clone().sub(i);
              var a = r.length(),
                n = t * t - a * a,
                o = 2 * s.dot(r),
                a = -s.dot(s);
              if (o * o - 4 * n * a < 0) return new l.Vector3();
              n = (-o + c.GameMath.sqrt(o * o - 4 * n * a)) / (2 * n);
              return r.clone().multiplyScalar(n).add(i);
            }
            static computeTurnCircle(e, t, i, r) {
              var s = r / n.degToRad(Math.abs(i));
              let a = n.rotateVec2(t.clone(), 90 * -Math.sign(i));
              return { center: isFinite(s) ? a.setLength(s).add(e) : e.clone(), radius: s };
            }
          }),
        );
      },
    };
  },
);
