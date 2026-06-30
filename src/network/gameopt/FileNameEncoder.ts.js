// === Reconstructed SystemJS module: network/gameopt/FileNameEncoder ===
// deps: ["util/Base64","util/string"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("network/gameopt/FileNameEncoder", ["util/Base64", "util/string"], function (e, t) {
  "use strict";
  var i, r, s;
  t && t.id;
  return {
    setters: [
      function (e) {
        i = e;
      },
      function (e) {
        r = e;
      },
    ],
    execute: function () {
      e(
        "FileNameEncoder",
        (s = class {
          encode(e) {
            return e.match(/^[a-z0-9-_]+\.[a-z]{3}$/i) ? e : i.Base64.encode(r.utf16ToBinaryString(e));
          }
          decode(e) {
            return e.match(/\.[a-z]{3}$/i) ? e : r.binaryStringToUtf16(i.Base64.decode(e));
          }
        }),
      );
    },
  };
});
