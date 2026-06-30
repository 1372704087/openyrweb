// === Reconstructed SystemJS module: game/math/QuadraticBezierCurve ===
// deps: ["game/math/Vector2"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/math/QuadraticBezierCurve", ["game/math/Vector2"], function (e, t) {
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
      ((i = class extends THREE.QuadraticBezierCurve {
        constructor(e, t, i) {
          super(e || new r.Vector2(), t || new r.Vector2(), i || new r.Vector2());
        }
        getPoint(e, t) {
          return super.getPoint(e, t || new r.Vector2());
        }
      }),
        e("QuadraticBezierCurve", i));
    },
  };
});
