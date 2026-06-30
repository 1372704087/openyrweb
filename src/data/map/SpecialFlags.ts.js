// === Reconstructed SystemJS module: data/map/SpecialFlags ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/map/SpecialFlags", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "SpecialFlags",
        (i = class {
          read(e) {
            return ((this.initialVeteran = e.getBool("InitialVeteran")), this);
          }
        }),
      );
    },
  };
});
