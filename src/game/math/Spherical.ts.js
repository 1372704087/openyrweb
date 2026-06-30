// === Reconstructed SystemJS module: game/math/Spherical ===
// deps: ["util/math","game/math/GameMath"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/math/Spherical", ["util/math", "game/math/GameMath"], function (e, t) {
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
      ((s = class extends THREE.Spherical {
        setFromVector3(e) {
          return (
            (this.radius = e.length()),
            0 === this.radius
              ? ((this.theta = 0), (this.phi = 0))
              : ((this.theta = r.GameMath.atan2(e.x, e.z)),
                (this.phi = r.GameMath.acos(i.clamp(e.y / this.radius, -1, 1)))),
            this
          );
        }
      }),
        e("Spherical", s));
    },
  };
});
