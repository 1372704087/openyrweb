// === Reconstructed SystemJS module: data/map/Variable ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("data/map/Variable", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "Variable",
        (i = class i {
          constructor(e, t) {
            ((this.name = e), (this.value = t));
          }
          clone() {
            return new i(this.name, this.value);
          }
        }),
      );
    },
  };
});
