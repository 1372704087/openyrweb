// === Reconstructed SystemJS module: game/math/Cylindrical ===
// deps: ["game/math/GameMath"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/math/Cylindrical", ["game/math/GameMath"], function (e, t) {
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
      ((r = class extends THREE.Cylindrical {
        setFromVector3(e) {
          return (
            (this.radius = i.GameMath.sqrt(e.x * e.x + e.z * e.z)),
            (this.theta = i.GameMath.atan2(e.x, e.z)),
            (this.y = e.y),
            this
          );
        }
      }),
        e("Cylindrical", r));
    },
  };
});
