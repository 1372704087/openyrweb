// === Reconstructed SystemJS module: data/Bitmap ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/Bitmap", [], function (t, e) {
  "use strict";
  var a, i, r;
  e && e.id;
  function d(e) {
    switch (e) {
      case a.Indexed:
        return 1;
      case a.Rgb:
        return 3;
      case a.Rgba:
        return 4;
      default:
        throw new Error("Unsupported pixel format " + e);
    }
  }
  return {
    setters: [],
    execute: function () {
      var e;
      (((e = a || t("PixelFormat", (a = {})))[(e.Rgb = 1)] = "Rgb"),
        (e[(e.Rgba = 2)] = "Rgba"),
        (e[(e.Indexed = 3)] = "Indexed"),
        t(
          "Bitmap",
          (i = class {
            constructor(e, t, i, r = a.Rgba) {
              var s = d(r);
              ((this.data = i || new Uint8Array(s * e * t)),
                (this.pixelFormat = r),
                (this.width = e),
                (this.height = t));
            }
            drawIndexedImage(t, e, i) {
              var r = d(this.pixelFormat);
              const s = this.data;
              var a = this.width,
                n = r * a,
                o = r * a * this.height;
              let l = 0 + n * i + r * e,
                c = 0;
              for (let u = 0; u < t.height; u++) {
                for (let e = 0; e < t.width; e++) {
                  var h = t.data[c];
                  (0 !== h &&
                    0 <= l &&
                    l < o &&
                    ((s[l] = h), 3 <= r && ((s[l + 1] = 0), (s[l + 2] = 0)), 4 === r && (s[l + 3] = 255)),
                    (l += r),
                    c++);
                }
                l += n - t.width * r;
              }
            }
          }),
        ),
        (r = class extends i {
          constructor(e, t, i) {
            super(e, t, i, a.Indexed);
          }
        }),
        t("IndexedBitmap", r),
        (r = class extends i {
          constructor(e, t, i) {
            super(e, t, i, a.Rgb);
          }
        }),
        t("RgbBitmap", r),
        (r = class extends i {
          constructor(e, t, i) {
            super(e, t, i, a.Rgba);
          }
          drawRgbaImage(t, e, i) {
            const r = this.data;
            var s = this.width,
              a = 4 * s,
              n = 4 * s * this.height;
            let o = 0 + a * i + 4 * e,
              l = 0;
            for (let c = 0; c < t.height; c++) {
              for (let e = 0; e < t.width; e++)
                (0 <= o &&
                  o < n &&
                  ((r[o] = t.data[l]),
                  (r[o + 1] = t.data[l + 1]),
                  (r[o + 2] = t.data[l + 2]),
                  (r[o + 3] = t.data[l + 3])),
                  (o += 4),
                  (l += 4));
              o += a - 4 * t.width;
            }
          }
        }),
        t("RgbaBitmap", r));
    },
  };
});
