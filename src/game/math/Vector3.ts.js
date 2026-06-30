// === Reconstructed SystemJS module: game/math/Vector3 ===
// deps: ["util/math","game/math/GameMath","game/math/Quaternion"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/math/Vector3", ["util/math", "game/math/GameMath", "game/math/Quaternion"], function (e, t) {
  "use strict";
  var i, r, s, a, n, o;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
      function (e) {
        r = e;
      },
      function (e) {
        s = e;
      },
    ],
    execute: function () {
      ((a = class extends THREE.Vector3 {
        applyEuler(e) {
          return (
            (e && e.isEuler) ||
              console.error(
                "THREE.Vector3: .applyEuler() now expects an Euler rotation rather than a Vector3 and order.",
              ),
            this.applyQuaternion(n.setFromEuler(e))
          );
        }
        applyAxisAngle(e, t) {
          return this.applyQuaternion(n.setFromAxisAngle(e, t));
        }
        length() {
          return r.GameMath.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        }
        projectOnPlane(e) {
          return (o.copy(this).projectOnVector(e), this.sub(o));
        }
        reflect(e) {
          return this.sub(o.copy(e).multiplyScalar(2 * this.dot(e)));
        }
        angleTo(e) {
          var t = this.dot(e) / r.GameMath.sqrt(this.lengthSq() * e.lengthSq());
          return r.GameMath.acos(i.clamp(t, -1, 1));
        }
        distanceTo(e) {
          return r.GameMath.sqrt(this.distanceToSquared(e));
        }
        setFromSpherical(e) {
          var t = r.GameMath.sin(e.phi) * e.radius;
          return (
            (this.x = t * r.GameMath.sin(e.theta)),
            (this.y = r.GameMath.cos(e.phi) * e.radius),
            (this.z = t * r.GameMath.cos(e.theta)),
            this
          );
        }
        setFromCylindrical(e) {
          return (
            (this.x = e.radius * r.GameMath.sin(e.theta)),
            (this.y = e.y),
            (this.z = e.radius * r.GameMath.cos(e.theta)),
            this
          );
        }
      }),
        e("Vector3", a),
        (n = new s.Quaternion()),
        (o = new a()));
    },
  };
});
