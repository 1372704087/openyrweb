// === Reconstructed SystemJS module: engine/renderable/entity/unit/RotorHelper ===
// deps: ["game/gameobject/unit/ZoneType","util/math"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "engine/renderable/entity/unit/RotorHelper",
  ["game/gameobject/unit/ZoneType", "util/math"],
  function (e, t) {
    "use strict";
    var l, c, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
      ],
      execute: function () {
        e(
          "RotorHelper",
          (i = class {
            static computeRotationStep(e, t, i) {
              var r = e.zone === l.ZoneType.Air,
                s = e.rules.idleRate,
                a = r || !!i.idleSpeed || !!s;
              let n = i.speed ?? 67;
              r || (i.idleSpeed ? (n = i.idleSpeed) : s && (n /= s));
              var o = Math.sign(n),
                r = Math.abs(THREE.Math.degToRad(n)),
                s = Math.abs(t);
              return o * c.clamp(s + 0.1 * (a ? 1 : (s / r) * -0.5), 0, r);
            }
          }),
        );
      },
    };
  },
);
