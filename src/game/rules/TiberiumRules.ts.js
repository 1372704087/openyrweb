// === Reconstructed SystemJS module: game/rules/TiberiumRules ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/TiberiumRules", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "TiberiumRules",
        (i = class {
          constructor(e) {
            this.type = e;
          }
          readIni(e) {
            return ((this.value = e.getNumber("Value")), this);
          }
        }),
      );
    },
  };
});
