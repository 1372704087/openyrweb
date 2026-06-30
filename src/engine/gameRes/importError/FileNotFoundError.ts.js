// === Reconstructed SystemJS module: engine/gameRes/importError/FileNotFoundError ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gameRes/importError/FileNotFoundError", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      ((i = class extends Error {
        constructor(e) {
          (super(`File "${e}" not found.`), (this.file = e));
        }
      }),
        e("FileNotFoundError", i));
    },
  };
});
