// === Reconstructed SystemJS module: data/vfs/IOError ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/vfs/IOError", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      ((i = class extends Error {
        constructor() {
          (super(...arguments), (this.name = "IOError"));
        }
      }),
        e("IOError", i));
    },
  };
});
