// === Reconstructed SystemJS module: engine/gameRes/importError/ArchiveDownloadError ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("engine/gameRes/importError/ArchiveDownloadError", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      ((i = class extends Error {
        constructor(e, t, i) {
          (super(t, i), (this.url = e));
        }
      }),
        e("ArchiveDownloadError", i));
    },
  };
});
