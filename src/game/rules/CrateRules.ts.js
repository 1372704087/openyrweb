// === Reconstructed SystemJS module: game/rules/CrateRules ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/CrateRules", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "CrateRules",
        (i = class {
          readIni(e) {
            ((this.crateMaximum = e.getNumber("CrateMaximum")),
              (this.crateMinimum = e.getNumber("CrateMinimum")),
              (this.crateRadius = e.getNumber("CrateRadius")),
              (this.crateRegen = e.getNumber("CrateRegen")));
            let t = e.getString("UnitCrateType");
            return (
              (this.unitCrateType = "none" !== t.toLowerCase() ? t : void 0),
              (this.healCrateSound = e.getString("HealCrateSound")),
              (this.crateImg = e.getString("CrateImg")),
              (this.waterCrateImg = e.getString("WaterCrateImg")),
              (this.freeMCV = e.getBool("FreeMCV")),
              this
            );
          }
        }),
      );
    },
  };
});
