// === Reconstructed SystemJS module: data/MixEntry ===
// deps: ["util/string","data/Crc32"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/MixEntry", ["util/string", "data/Crc32"], function (e, t) {
  "use strict";
  var s, a, i;
  t && t.id;
  return {
    setters: [
      function (e) {
        s = e;
      },
      function (e) {
        a = e;
      },
    ],
    execute: function () {
      (e(
        "MixEntry",
        (i = class {
          static hashFilename(t) {
            var i = (t = t.toUpperCase()).length,
              r = i >> 2;
            if (0 != (3 & i)) {
              t += String.fromCharCode(i - (r << 2));
              let e = 3 - (3 & i);
              for (; 0 != e--;) t += t[r << 2];
            }
            return a.Crc32.calculateCrc(s.binaryStringToUint8Array(t));
          }
          constructor(e, t, i) {
            ((this.hash = e), (this.offset = t), (this.length = i));
          }
        }),
      ),
        (i.size = 12));
    },
  };
});
