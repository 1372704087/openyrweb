// === Reconstructed SystemJS module: data/encoding/MiniLzo ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/encoding/MiniLzo", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "MiniLzo",
        (i = class {
          static decompress(e, t) {
            var i = { inputBuffer: e, outputBuffer: null },
              r = lzo1x.decompress(i, { outputSize: t });
            if (0 !== r) throw new Error("MiniLzo decode failed with code " + r);
            return i.outputBuffer;
          }
        }),
      );
    },
  };
});
