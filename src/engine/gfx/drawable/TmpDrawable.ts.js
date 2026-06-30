// === Reconstructed SystemJS module: engine/gfx/drawable/TmpDrawable ===
// deps: ["data/Bitmap"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gfx/drawable/TmpDrawable", ["data/Bitmap"], function (e, t) {
  "use strict";
  var l, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        l = e;
      },
    ],
    execute: function () {
      e(
        "TmpDrawable",
        (i = class {
          drawTileBlock(t, i, e, r, s, a) {
            let n = i.data;
            var o = r / 2;
            let l = e / 2 - 2 + i.width * a + s;
            var c = i.width * i.height;
            let h = 0,
              u = 0,
              d = 0;
            for (; u < o; u++) {
              d += 4;
              for (let e = 0; e < d; e++) {
                var g = t.tileData[h];
                (0 !== g && 0 <= l && l < c && (n[l] = g), l++, h++);
              }
              l += i.width - (d + 2);
            }
            for (l += 4; u < r; u++) {
              d -= 4;
              for (let e = 0; e < d; e++) {
                var p = t.tileData[h];
                (0 <= l && l < c && (n[l] = p), (l += 1), h++);
              }
              l += i.width - (d - 2);
            }
          }
          draw(e, t, i) {
            let r = t,
              s = i,
              a = 0,
              n = 0;
            e.hasExtraData &&
              ((a += Math.max(0, e.x - e.extraX)),
              (n += Math.max(0, e.y - e.extraY)),
              (r += Math.max(0, e.x - e.extraX)),
              (s += Math.max(0, e.y - e.extraY)));
            var o = new l.IndexedBitmap(r, s);
            return (this.drawTileBlock(e, o, t, i, a, n), e.hasExtraData && this.drawExtraData(e, o), o);
          }
          drawExtraData(s, a) {
            if (s.hasExtraData) {
              let t = a.data;
              var n = a.width,
                o = a.height,
                l = Math.max(0, s.extraX - s.x),
                c = n,
                h = n * o;
              let i = 0 + c * Math.max(0, s.extraY - s.y) + l,
                r = 0;
              for (let e = 0; e < s.extraHeight; e++) {
                for (let e = 0; e < s.extraWidth; e++) {
                  var u = s.extraData[r];
                  (0 !== u && 0 <= i && i < h && (t[i] = u), (i += 1), r++);
                }
                i += c - s.extraWidth;
              }
            }
          }
        }),
      );
    },
  };
});
