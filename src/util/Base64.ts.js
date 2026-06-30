// === Reconstructed SystemJS module: util/Base64 ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("util/Base64", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "Base64",
        (i = class {
          static encode(e) {
            return void 0 !== globalThis.btoa ? globalThis.btoa(e) : Buffer.from(e, "binary").toString("base64");
          }
          static decode(e) {
            return void 0 !== globalThis.atob ? globalThis.atob(e) : Buffer.from(e, "base64").toString("binary");
          }
          static isBase64(e) {
            return !!e.match(/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/);
          }
        }),
      );
    },
  };
});
