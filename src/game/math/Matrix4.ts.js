// === Reconstructed SystemJS module: game/math/Matrix4 ===
// deps: ["game/math/GameMath","game/math/Vector3"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/math/Matrix4", ["game/math/GameMath", "game/math/Vector3"], function (e, t) {
  "use strict";
  var b, i, r, c, s, a, n, h;
  t && t.id;
  return {
    setters: [
      function (e) {
        b = e;
      },
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      ((r = class extends THREE.Matrix4 {
        extractRotation(e) {
          let t = this.elements;
          var i = e.elements,
            r = 1 / c.setFromMatrixColumn(e, 0).length(),
            s = 1 / c.setFromMatrixColumn(e, 1).length(),
            a = 1 / c.setFromMatrixColumn(e, 2).length();
          return (
            (t[0] = i[0] * r),
            (t[1] = i[1] * r),
            (t[2] = i[2] * r),
            (t[3] = 0),
            (t[4] = i[4] * s),
            (t[5] = i[5] * s),
            (t[6] = i[6] * s),
            (t[7] = 0),
            (t[8] = i[8] * a),
            (t[9] = i[9] * a),
            (t[10] = i[10] * a),
            (t[11] = 0),
            (t[12] = 0),
            (t[13] = 0),
            (t[14] = 0),
            (t[15] = 1),
            this
          );
        }
        makeRotationFromEuler(e) {
          (e && e.isEuler) ||
            console.error(
              "THREE.Matrix4: .makeRotationFromEuler() now expects a Euler rotation rather than a Vector3 and order.",
            );
          let t = this.elements;
          var i,
            r,
            s,
            a,
            n,
            o,
            l,
            c,
            h,
            u,
            d,
            g,
            p = e.x,
            m = e.y,
            f = e.z,
            y = b.GameMath.cos(p),
            T = b.GameMath.sin(p),
            v = b.GameMath.cos(m),
            p = b.GameMath.sin(m),
            m = b.GameMath.cos(f),
            f = b.GameMath.sin(f);
          return (
            "XYZ" === e.order
              ? ((r = y * m),
                (a = y * f),
                (s = T * m),
                (i = T * f),
                (t[0] = v * m),
                (t[4] = -v * f),
                (t[8] = p),
                (t[1] = a + s * p),
                (t[5] = r - i * p),
                (t[9] = -T * v),
                (t[2] = i - r * p),
                (t[6] = s + a * p),
                (t[10] = y * v))
              : "YXZ" === e.order
                ? ((i = v * m),
                  (r = v * f),
                  (s = p * m),
                  (a = p * f),
                  (t[0] = i + a * T),
                  (t[4] = s * T - r),
                  (t[8] = y * p),
                  (t[1] = y * f),
                  (t[5] = y * m),
                  (t[9] = -T),
                  (t[2] = r * T - s),
                  (t[6] = a + i * T),
                  (t[10] = y * v))
                : "ZXY" === e.order
                  ? ((c = v * m),
                    (n = v * f),
                    (o = p * m),
                    (l = p * f),
                    (t[0] = c - l * T),
                    (t[4] = -y * f),
                    (t[8] = o + n * T),
                    (t[1] = n + o * T),
                    (t[5] = y * m),
                    (t[9] = l - c * T),
                    (t[2] = -y * p),
                    (t[6] = T),
                    (t[10] = y * v))
                  : "ZYX" === e.order
                    ? ((n = y * m),
                      (o = y * f),
                      (l = T * m),
                      (c = T * f),
                      (t[0] = v * m),
                      (t[4] = l * p - o),
                      (t[8] = n * p + c),
                      (t[1] = v * f),
                      (t[5] = c * p + n),
                      (t[9] = o * p - l),
                      (t[2] = -p),
                      (t[6] = T * v),
                      (t[10] = y * v))
                    : "YZX" === e.order
                      ? ((d = y * v),
                        (h = y * p),
                        (u = T * v),
                        (g = T * p),
                        (t[0] = v * m),
                        (t[4] = g - d * f),
                        (t[8] = u * f + h),
                        (t[1] = f),
                        (t[5] = y * m),
                        (t[9] = -T * m),
                        (t[2] = -p * m),
                        (t[6] = h * f + u),
                        (t[10] = d - g * f))
                      : "XZY" === e.order &&
                        ((h = y * v),
                        (u = y * p),
                        (d = T * v),
                        (g = T * p),
                        (t[0] = v * m),
                        (t[4] = -f),
                        (t[8] = p * m),
                        (t[1] = h * f + g),
                        (t[5] = y * m),
                        (t[9] = u * f - d),
                        (t[2] = d * f - u),
                        (t[6] = T * m),
                        (t[10] = g * f + h)),
            (t[3] = 0),
            (t[7] = 0),
            (t[11] = 0),
            (t[12] = 0),
            (t[13] = 0),
            (t[14] = 0),
            (t[15] = 1),
            this
          );
        }
        lookAt(e, t, i) {
          (s.set(0, 0, 0), a.set(0, 0, 0), n.set(0, 0, 0));
          const r = this.elements;
          return (
            n.subVectors(e, t),
            0 === n.lengthSq() && (n.z = 1),
            n.normalize(),
            s.crossVectors(i, n),
            0 === s.lengthSq() &&
              (1 === Math.abs(i.z) ? (n.x += 1e-4) : (n.z += 1e-4), n.normalize(), s.crossVectors(i, n)),
            s.normalize(),
            a.crossVectors(n, s),
            (r[0] = s.x),
            (r[4] = a.x),
            (r[8] = n.x),
            (r[1] = s.y),
            (r[5] = a.y),
            (r[9] = n.y),
            (r[2] = s.z),
            (r[6] = a.z),
            (r[10] = n.z),
            this
          );
        }
        getMaxScaleOnAxis() {
          var e = this.elements,
            t = e[0] * e[0] + e[1] * e[1] + e[2] * e[2],
            i = e[4] * e[4] + e[5] * e[5] + e[6] * e[6],
            e = e[8] * e[8] + e[9] * e[9] + e[10] * e[10];
          return b.GameMath.sqrt(Math.max(t, i, e));
        }
        makeRotationX(e) {
          var t = b.GameMath.cos(e),
            i = b.GameMath.sin(e);
          return (this.set(1, 0, 0, 0, 0, t, -i, 0, 0, i, t, 0, 0, 0, 0, 1), this);
        }
        makeRotationY(e) {
          var t = b.GameMath.cos(e),
            i = b.GameMath.sin(e);
          return (this.set(t, 0, i, 0, 0, 1, 0, 0, -i, 0, t, 0, 0, 0, 0, 1), this);
        }
        makeRotationZ(e) {
          var t = b.GameMath.cos(e),
            i = b.GameMath.sin(e);
          return (this.set(t, -i, 0, 0, i, t, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this);
        }
        makeRotationAxis(e, t) {
          var i = b.GameMath.cos(t),
            r = b.GameMath.sin(t),
            s = 1 - i,
            a = e.x,
            n = e.y,
            o = e.z,
            l = s * a,
            c = s * n;
          return (
            this.set(
              l * a + i,
              l * n - r * o,
              l * o + r * n,
              0,
              l * n + r * o,
              c * n + i,
              c * o - r * a,
              0,
              l * o - r * n,
              c * o + r * a,
              s * o * o + i,
              0,
              0,
              0,
              0,
              1,
            ),
            this
          );
        }
        decompose(e, t, i) {
          var r = this.elements;
          let s = c.set(r[0], r[1], r[2]).length();
          var a = c.set(r[4], r[5], r[6]).length(),
            n = c.set(r[8], r[9], r[10]).length();
          (this.determinant() < 0 && (s = -s), (e.x = r[12]), (e.y = r[13]), (e.z = r[14]), h.copy(this));
          var o = 1 / s,
            l = 1 / a,
            r = 1 / n;
          return (
            (h.elements[0] *= o),
            (h.elements[1] *= o),
            (h.elements[2] *= o),
            (h.elements[4] *= l),
            (h.elements[5] *= l),
            (h.elements[6] *= l),
            (h.elements[8] *= r),
            (h.elements[9] *= r),
            (h.elements[10] *= r),
            t.setFromRotationMatrix(h),
            (i.x = s),
            (i.y = a),
            (i.z = n),
            this
          );
        }
      }),
        e("Matrix4", r),
        (c = new i.Vector3()),
        (s = new i.Vector3()),
        (a = new i.Vector3()),
        (n = new i.Vector3()),
        (h = new r()));
    },
  };
});
