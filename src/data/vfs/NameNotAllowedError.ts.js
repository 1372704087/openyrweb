// === Reconstructed SystemJS module: data/vfs/NameNotAllowedError ===
// deps: ["data/vfs/IOError"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/vfs/NameNotAllowedError", ["data/vfs/IOError"], function (e, t) {
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
      ((r = class extends i.IOError {
        constructor() {
          (super(...arguments), (this.name = "NameNotAllowedError"));
        }
      }),
        e("NameNotAllowedError", r));
    },
  };
});
