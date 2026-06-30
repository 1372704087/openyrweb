// === Reconstructed SystemJS module: game/math/Quaternion ===
// deps: ["game/math/GameMath"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/math/Quaternion", ["game/math/GameMath"], function (e, t) {
  "use strict";
  var g, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        g = e;
      },
    ],
    execute: function () {
      ((i = class extends THREE.Quaternion {
        setFromEuler(e, t) {
          if (!e || !e.isEuler)
            throw new Error(
              "THREE.Quaternion: .setFromEuler() now expects an Euler rotation rather than a Vector3 and order.",
            );
          var i = e.x,
            r = e.y,
            s = e.z,
            a = e.order,
            n = g.GameMath.cos(i / 2),
            o = g.GameMath.cos(r / 2),
            l = g.GameMath.cos(s / 2),
            i = g.GameMath.sin(i / 2),
            r = g.GameMath.sin(r / 2),
            s = g.GameMath.sin(s / 2);
          return (
            "XYZ" === a
              ? ((this._x = i * o * l + n * r * s),
                (this._y = n * r * l - i * o * s),
                (this._z = n * o * s + i * r * l),
                (this._w = n * o * l - i * r * s))
              : "YXZ" === a
                ? ((this._x = i * o * l + n * r * s),
                  (this._y = n * r * l - i * o * s),
                  (this._z = n * o * s - i * r * l),
                  (this._w = n * o * l + i * r * s))
                : "ZXY" === a
                  ? ((this._x = i * o * l - n * r * s),
                    (this._y = n * r * l + i * o * s),
                    (this._z = n * o * s + i * r * l),
                    (this._w = n * o * l - i * r * s))
                  : "ZYX" === a
                    ? ((this._x = i * o * l - n * r * s),
                      (this._y = n * r * l + i * o * s),
                      (this._z = n * o * s - i * r * l),
                      (this._w = n * o * l + i * r * s))
                    : "YZX" === a
                      ? ((this._x = i * o * l + n * r * s),
                        (this._y = n * r * l + i * o * s),
                        (this._z = n * o * s - i * r * l),
                        (this._w = n * o * l - i * r * s))
                      : "XZY" === a &&
                        ((this._x = i * o * l - n * r * s),
                        (this._y = n * r * l - i * o * s),
                        (this._z = n * o * s + i * r * l),
                        (this._w = n * o * l + i * r * s)),
            !1 !== t && this.onChangeCallback(),
            this
          );
        }
        setFromAxisAngle(e, t) {
          var i = t / 2,
            r = g.GameMath.sin(i);
          return (
            (this._x = e.x * r),
            (this._y = e.y * r),
            (this._z = e.z * r),
            (this._w = g.GameMath.cos(i)),
            this.onChangeCallback(),
            this
          );
        }
        setFromRotationMatrix(e) {
          let t = e.elements,
            i = t[0],
            r = t[4],
            s = t[8],
            a = t[1],
            n = t[5],
            o = t[9],
            l = t[2],
            c = t[6],
            h = t[10],
            u = i + n + h,
            d;
          return (
            0 < u
              ? ((d = 0.5 / g.GameMath.sqrt(u + 1)),
                (this._w = 0.25 / d),
                (this._x = (c - o) * d),
                (this._y = (s - l) * d),
                (this._z = (a - r) * d))
              : n < i && h < i
                ? ((d = 2 * g.GameMath.sqrt(1 + i - n - h)),
                  (this._w = (c - o) / d),
                  (this._x = 0.25 * d),
                  (this._y = (r + a) / d),
                  (this._z = (s + l) / d))
                : h < n
                  ? ((d = 2 * g.GameMath.sqrt(1 + n - i - h)),
                    (this._w = (s - l) / d),
                    (this._x = (r + a) / d),
                    (this._y = 0.25 * d),
                    (this._z = (o + c) / d))
                  : ((d = 2 * g.GameMath.sqrt(1 + h - i - n)),
                    (this._w = (a - r) / d),
                    (this._x = (s + l) / d),
                    (this._y = (o + c) / d),
                    (this._z = 0.25 * d)),
            this.onChangeCallback(),
            this
          );
        }
        length() {
          return g.GameMath.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
        }
        slerp(e, t) {
          if (0 === t) return this;
          if (1 === t) return this.copy(e);
          var i = this._x,
            r = this._y,
            s = this._z,
            a = this._w;
          let n = a * e._w + i * e._x + r * e._y + s * e._z;
          if (
            (n < 0
              ? ((this._w = -e._w), (this._x = -e._x), (this._y = -e._y), (this._z = -e._z), (n = -n))
              : this.copy(e),
            1 <= n)
          )
            return ((this._w = a), (this._x = i), (this._y = r), (this._z = s), this);
          var o = 1 - n * n;
          if (o <= Number.EPSILON) {
            var l = 1 - t;
            return (
              (this._w = l * a + t * this._w),
              (this._x = l * i + t * this._x),
              (this._y = l * r + t * this._y),
              (this._z = l * s + t * this._z),
              this.normalize()
            );
          }
          var c = g.GameMath.sqrt(o),
            l = g.GameMath.atan2(c, n),
            o = g.GameMath.sin((1 - t) * l) / c,
            c = g.GameMath.sin(t * l) / c;
          return (
            (this._w = a * o + this._w * c),
            (this._x = i * o + this._x * c),
            (this._y = r * o + this._y * c),
            (this._z = s * o + this._z * c),
            this.onChangeCallback(),
            this
          );
        }
      }),
        e("Quaternion", i));
    },
  };
});
