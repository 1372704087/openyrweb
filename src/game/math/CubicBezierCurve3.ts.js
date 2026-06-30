// === Reconstructed SystemJS module: game/math/CubicBezierCurve3 ===
// deps: ["game/math/Vector3"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/math/CubicBezierCurve3", ["game/math/Vector3"], function (e, t) {
  "use strict";
  var s, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        s = e;
      },
    ],
    execute: function () {
      ((i = class extends THREE.CubicBezierCurve3 {
        constructor(e, t, i, r) {
          super(e || new s.Vector3(), t || new s.Vector3(), i || new s.Vector3(), r || new s.Vector3());
        }
        getPoint(e, t) {
          return super.getPoint(e, t || new s.Vector3());
        }
      }),
        e("CubicBezierCurve3", i));
    },
  };
});
