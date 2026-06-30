// === Reconstructed SystemJS module: game/math/LineCurve ===
// deps: ["game/math/Vector2"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/math/LineCurve", ["game/math/Vector2"], function (e, t) {
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
      ((r = class extends THREE.LineCurve {
        constructor(e, t) {
          super(e || new i.Vector2(), t || new i.Vector2());
        }
        getPoint(e, t) {
          return super.getPoint(e, t || new i.Vector2());
        }
      }),
        e("LineCurve", r));
    },
  };
});
