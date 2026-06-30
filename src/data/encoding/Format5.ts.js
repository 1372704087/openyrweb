// === Reconstructed SystemJS module: data/encoding/Format5 ===
// deps: ["data/encoding/Format80","data/encoding/MiniLzo"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/encoding/Format5", ["data/encoding/Format80", "data/encoding/MiniLzo"], function (e, t) {
  "use strict";
  var c, h, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        c = e;
      },
      function (e) {
        h = e;
      },
    ],
    execute: function () {
      e(
        "Format5",
        (i = class {
          static decode(e, t, i = 5) {
            var r = new Uint8Array(t);
            return (this.decodeInto(e, r, i), r);
          }
          static decodeInto(i, r, s = 5) {
            var e = r.length;
            let a = 0,
              n = 0;
            for (; n < e;) {
              var o = (i[a + 1] << 8) | i[a];
              a += 2;
              var l = (i[a + 1] << 8) | i[a];
              if (((a += 2), !o || !l)) break;
              let e;
              e = 80 === s ? c.Format80.decode(i.subarray(a, a + o), l) : h.MiniLzo.decompress(i.subarray(a, a + o), l);
              for (let t = 0; t < l; ++t) r[n + t] = e[t];
              ((a += o), (n += l));
            }
          }
        }),
      );
    },
  };
});
