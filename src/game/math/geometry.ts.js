// === Reconstructed SystemJS module: game/math/geometry ===
// deps: ["util/math","game/math/GameMath","game/math/Matrix4","game/math/Quaternion","game/math/Vector2","game/math/Vector3"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/math/geometry",
  [
    "util/math",
    "game/math/GameMath",
    "game/math/Matrix4",
    "game/math/Quaternion",
    "game/math/Vector2",
    "game/math/Vector3",
  ],
  function (e, t) {
    "use strict";
    var r, s, i, a, n, o, l, c, h, u, d, g;
    t && t.id;
    function p(e) {
      return e * THREE.Math.RAD2DEG;
    }
    function m(e) {
      return e * THREE.Math.DEG2RAD;
    }
    function f(e) {
      return Math.round(p(e.angle()));
    }
    function y(e, t) {
      var i = p(2 * s.GameMath.acos(Math.abs(r.clamp(e.dot(t), -1, 1))));
      return Math.round(i);
    }
    function T(e, t = new a.Quaternion()) {
      return t.setFromRotationMatrix(c.lookAt(e, h, u));
    }
    return (
      e("radToDeg", p),
      e("degToRad", m),
      e("rotateVec2", function (e, t) {
        var i = m(Math.floor(t));
        return e.rotateAround(l, i);
      }),
      e("angleDegFromVec2", f),
      e("angleDegBetweenVec2", function (e, t) {
        var i = f(e),
          r = f(t);
        return Math.min((i - r + 360) % 360, (r - i + 360) % 360);
      }),
      e("angleDegBetweenVec3", function (e, t) {
        return y(T(e, d), T(t, g));
      }),
      e("quaternionFromVec3", T),
      e("rotateVec3Towards", function (e, t, i) {
        var r = e.length(),
          s = T(t, d),
          a = T(e, g);
        (!(function (e, t, i) {
          var r = y(e, t);
          if (0 !== r) {
            r = Math.min(1, i / r);
            e.slerp(t, r);
          }
        })(a, s, i),
          e.set(0, 0, 1).applyQuaternion(a).setLength(r));
      }),
      {
        setters: [
          function (e) {
            r = e;
          },
          function (e) {
            s = e;
          },
          function (e) {
            i = e;
          },
          function (e) {
            a = e;
          },
          function (e) {
            n = e;
          },
          function (e) {
            o = e;
          },
        ],
        execute: function () {
          ((l = new n.Vector2()),
            (c = new i.Matrix4()),
            (h = new o.Vector3(0, 0, 0)),
            (u = new o.Vector3(0, 1, 0)),
            (d = new a.Quaternion()),
            (g = new a.Quaternion()));
        },
      }
    );
  },
);
