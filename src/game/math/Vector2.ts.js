// === Reconstructed SystemJS module: game/math/Vector2 ===
// deps: ["game/math/GameMath"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/math/Vector2", ["game/math/GameMath"], function (e, t) {
  "use strict";
  var n, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        n = e;
      },
    ],
    execute: function () {
      ((i = class extends THREE.Vector2 {
        length() {
          return n.GameMath.sqrt(this.x * this.x + this.y * this.y);
        }
        angle() {
          let e = n.GameMath.atan2(this.y, this.x);
          return (e < 0 && (e += 2 * Math.PI), e);
        }
        distanceTo(e) {
          return n.GameMath.sqrt(this.distanceToSquared(e));
        }
        rotateAround(e, t) {
          var i = n.GameMath.cos(t),
            r = n.GameMath.sin(t),
            s = this.x - e.x,
            a = this.y - e.y;
          return ((this.x = s * i - a * r + e.x), (this.y = s * r + a * i + e.y), this);
        }
      }),
        e("Vector2", i));
    },
  };
});
