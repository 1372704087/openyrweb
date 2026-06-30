// === Reconstructed SystemJS module: engine/gfx/drawable/PalDrawable ===
// deps: ["data/Bitmap"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gfx/drawable/PalDrawable", ["data/Bitmap"], function (e, t) {
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
      e(
        "PalDrawable",
        (i = class {
          constructor(e) {
            this.pal = e;
          }
          draw() {
            var e = this.pal.size;
            let t = new n.RgbaBitmap(e, 1),
              i = 0;
            for (let s = 0, a = e; s < a; ++s) {
              var r = this.pal.getColor(s);
              ((t.data[i] = r.r),
                (t.data[i + 1] = r.g),
                (t.data[i + 2] = r.b),
                (t.data[i + 3] = s ? 255 : 0),
                (i += 4));
            }
            return t;
          }
        }),
      );
    },
  };
});
