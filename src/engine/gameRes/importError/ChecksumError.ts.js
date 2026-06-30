// === Reconstructed SystemJS module: engine/gameRes/importError/ChecksumError ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gameRes/importError/ChecksumError", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      ((i = class extends Error {
        constructor(e, t) {
          (super(e), (this.file = t));
        }
      }),
        e("ChecksumError", i));
    },
  };
});
