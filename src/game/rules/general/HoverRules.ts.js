// === Reconstructed SystemJS module: game/rules/general/HoverRules ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/general/HoverRules", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "HoverRules",
        (i = class {
          readIni(e) {
            return (
              (this.height = e.getNumber("HoverHeight")),
              (this.dampen = e.getNumber("HoverDampen")),
              (this.bob = e.getNumber("HoverBob")),
              (this.boost = e.getNumber("HoverBoost")),
              (this.acceleration = e.getNumber("HoverAcceleration")),
              (this.brake = e.getNumber("HoverBrake")),
              this
            );
          }
        }),
      );
    },
  };
});
