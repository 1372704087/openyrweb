// === Reconstructed SystemJS module: game/math/Euler ===
// deps: ["util/math","game/math/GameMath","game/math/Quaternion","game/math/Vector3"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/math/Euler",
  ["util/math", "game/math/GameMath", "game/math/Quaternion", "game/math/Vector3"],
  function (e, t) {
    "use strict";
    var d, g, i, r, s, a;
    t && t.id;
    return {
      setters: [
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          i = e;
        },
        function (e) {
          r = e;
        },
      ],
      execute: function () {
        ((s = class extends THREE.Euler {
          constructor() {
            (super(...arguments), (this.isEuler = !0));
          }
          setFromRotationMatrix(e, t, i) {
            var r = e.elements,
              s = r[0],
              a = r[4],
              n = r[8],
              o = r[1],
              l = r[5],
              c = r[9],
              h = r[2],
              u = r[6],
              r = r[10];
            return (
              "XYZ" === (t = t || this._order)
                ? ((this._y = g.GameMath.asin(d.clamp(n, -1, 1))),
                  Math.abs(n) < 0.99999
                    ? ((this._x = g.GameMath.atan2(-c, r)), (this._z = g.GameMath.atan2(-a, s)))
                    : ((this._x = g.GameMath.atan2(u, l)), (this._z = 0)))
                : "YXZ" === t
                  ? ((this._x = g.GameMath.asin(-d.clamp(c, -1, 1))),
                    Math.abs(c) < 0.99999
                      ? ((this._y = g.GameMath.atan2(n, r)), (this._z = g.GameMath.atan2(o, l)))
                      : ((this._y = g.GameMath.atan2(-h, s)), (this._z = 0)))
                  : "ZXY" === t
                    ? ((this._x = g.GameMath.asin(d.clamp(u, -1, 1))),
                      Math.abs(u) < 0.99999
                        ? ((this._y = g.GameMath.atan2(-h, r)), (this._z = g.GameMath.atan2(-a, l)))
                        : ((this._y = 0), (this._z = g.GameMath.atan2(o, s))))
                    : "ZYX" === t
                      ? ((this._y = g.GameMath.asin(-d.clamp(h, -1, 1))),
                        Math.abs(h) < 0.99999
                          ? ((this._x = g.GameMath.atan2(u, r)), (this._z = g.GameMath.atan2(o, s)))
                          : ((this._x = 0), (this._z = g.GameMath.atan2(-a, l))))
                      : "YZX" === t
                        ? ((this._z = g.GameMath.asin(d.clamp(o, -1, 1))),
                          Math.abs(o) < 0.99999
                            ? ((this._x = g.GameMath.atan2(-c, l)), (this._y = g.GameMath.atan2(-h, s)))
                            : ((this._x = 0), (this._y = g.GameMath.atan2(n, r))))
                        : "XZY" === t
                          ? ((this._z = g.GameMath.asin(-d.clamp(a, -1, 1))),
                            Math.abs(a) < 0.99999
                              ? ((this._x = g.GameMath.atan2(u, l)), (this._y = g.GameMath.atan2(n, s)))
                              : ((this._x = g.GameMath.atan2(-c, r)), (this._y = 0)))
                          : console.warn("THREE.Euler: .setFromRotationMatrix() given unsupported order: " + t),
              (this._order = t),
              !1 !== i && this.onChangeCallback(),
              this
            );
          }
          reorder(e) {
            return (a.setFromEuler(this), this.setFromQuaternion(a, e));
          }
          toVector3(e) {
            return e ? e.set(this._x, this._y, this._z) : new r.Vector3(this._x, this._y, this._z);
          }
        }),
          e("Euler", s),
          (a = new i.Quaternion()));
      },
    };
  },
);
