// === Reconstructed SystemJS module: data/vfs/FileNotFoundError ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/vfs/FileNotFoundError", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      ((i = class extends Error {
        constructor() {
          (super(...arguments), (this.name = "FileNotFoundError"));
        }
      }),
        e("FileNotFoundError", i));
    },
  };
});
