// === Reconstructed SystemJS module: game/math/CurvePath ===
// deps: ["game/math/LineCurve"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/math/CurvePath", ["game/math/LineCurve"], function (e, t) {
  "use strict";
  var i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      ((r = class extends THREE.CurvePath {
        closePath() {
          let e = this.curves[0].getPoint(0);
          var t = this.curves[this.curves.length - 1].getPoint(1);
          e.equals(t) || this.curves.push(new i.LineCurve(t, e));
        }
      }),
        e("CurvePath", r));
    },
  };
});
