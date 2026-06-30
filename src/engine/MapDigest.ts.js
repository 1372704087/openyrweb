// === Reconstructed SystemJS module: engine/MapDigest ===
// deps: ["data/Crc32"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/MapDigest", ["data/Crc32"], function (e, t) {
  "use strict";
  var i, r;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
    ],
    execute: function () {
      e(
        "MapDigest",
        (r = class {
          static compute(e) {
            return i.Crc32.calculateCrc(e.getBytes()).toString(16);
          }
        }),
      );
    },
  };
});
