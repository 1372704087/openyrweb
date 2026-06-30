// === Reconstructed SystemJS module: game/rules/general/VeteranRules ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/general/VeteranRules", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "VeteranRules",
        (i = class {
          readIni(e) {
            return (
              (this.veteranRatio = e.getNumber("VeteranRatio", 3)),
              (this.veteranCombat = e.getNumber("VeteranCombat", 1)),
              (this.veteranSpeed = e.getNumber("VeteranSpeed", 1)),
              (this.veteranSight = Math.max(1, e.getNumber("VeteranSight", 1))),
              (this.veteranArmor = e.getNumber("VeteranArmor", 1)),
              (this.veteranROF = e.getNumber("VeteranROF", 1)),
              (this.veteranCap = e.getNumber("VeteranCap", 2)),
              (this.initialVeteran = e.getBool("InitialVeteran")),
              this
            );
          }
        }),
      );
    },
  };
});
