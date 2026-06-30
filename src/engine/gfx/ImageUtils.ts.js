// === Reconstructed SystemJS module: engine/gfx/ImageUtils ===
// deps: ["data/Bitmap","engine/gfx/CanvasUtils"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gfx/ImageUtils", ["data/Bitmap", "engine/gfx/CanvasUtils"], function (e, t) {
  "use strict";
  var u, s, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        u = e;
      },
      function (e) {
        s = e;
      },
    ],
    execute: function () {
      e(
        "ImageUtils",
        (r = class r {
          static async convertShpToPng(e, t) {
            var i = r.convertShpToCanvas(e, t);
            return await s.CanvasUtils.canvasToBlob(i);
          }
          static convertShpToBitmap(e, t, i = !1) {
            let r = 0,
              s = 0,
              a = e.width,
              n = e.height;
            a !== n &&
              i &&
              ((r = a > n ? 0 : Math.floor((n - a) / 2)),
              (s = a > n ? Math.floor((a - n) / 2) : 0),
              (a = n = Math.max(a, n)));
            let o = new u.IndexedBitmap(e.numImages * a, n);
            for (let h = 0; h < e.numImages; h++) {
              var l = e.getImage(h),
                c = new u.IndexedBitmap(l.width, l.height, l.imageData);
              o.drawIndexedImage(c, h * a + l.x + r, l.y + s);
            }
            return o;
          }
          static convertShpToCanvas(e, t, i = !1) {
            var r = this.convertShpToBitmap(e, t, i);
            return s.CanvasUtils.canvasFromIndexedImageData(r.data, r.width, r.height, t);
          }
        }),
      );
    },
  };
});
