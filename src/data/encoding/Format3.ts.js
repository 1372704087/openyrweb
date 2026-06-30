// === Reconstructed SystemJS module: data/encoding/Format3 ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/encoding/Format3", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "Format3",
        (i = class {
          static decode(r, s, e) {
            let a = new Uint8Array(s * e),
              n = 0,
              o = 0;
            for (let t = 0; t < e; t++) {
              let t = ((r[n + 1] << 8) | r[n]) - 2;
              n += 2;
              let i = 0;
              for (; 0 < t--;) {
                let e = r[n++];
                if (0 !== e) (i++, (a[o++] = e));
                else for (t--, e = r[n++], i + e > s && (e = (s - i) & 255), i += e; 0 != e--;) a[o++] = 0;
              }
            }
            return a;
          }
        }),
      );
    },
  };
});
