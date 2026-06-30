// === Reconstructed SystemJS module: game/rules/general/PrismRules ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/general/PrismRules", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "PrismRules",
        (i = class {
          readIni(e) {
            return (
              (this.type = e.getString("PrismType")),
              (this.supportHeight = e.getNumber("PrismSupportHeight")),
              (this.supportMax = e.getNumber("PrismSupportMax")),
              (this.supportModifier = e.getNumber("PrismSupportModifier", 1)),
              this
            );
          }
        }),
      );
    },
  };
});
