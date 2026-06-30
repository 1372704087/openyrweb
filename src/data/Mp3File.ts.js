// === Reconstructed SystemJS module: data/Mp3File ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/Mp3File", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "Mp3File",
        (i = class {
          constructor(e) {
            this.file = e;
          }
          asFile() {
            return new File([this.file], this.file.name, { type: "audio/mp3" });
          }
        }),
      );
    },
  };
});
