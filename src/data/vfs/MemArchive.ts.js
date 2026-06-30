// === Reconstructed SystemJS module: data/vfs/MemArchive ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/vfs/MemArchive", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "MemArchive",
        (i = class {
          constructor() {
            this.entries = new Map();
          }
          addFile(e) {
            this.entries.set(e.filename, e);
          }
          containsFile(e) {
            return this.entries.has(e);
          }
          openFile(e) {
            if (!this.containsFile(e)) throw new Error(`File "${e}" not found`);
            return this.entries.get(e);
          }
        }),
      );
    },
  };
});
