// === Reconstructed SystemJS module: data/vfs/StorageQuotaError ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/vfs/StorageQuotaError", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      ((i = class extends Error {
        constructor(e) {
          (super("Storage quota exceeded", e), (this.name = "StorageQuotaError"));
        }
      }),
        e("StorageQuotaError", i));
    },
  };
});
