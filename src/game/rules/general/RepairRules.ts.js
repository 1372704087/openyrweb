// === Reconstructed SystemJS module: game/rules/general/RepairRules ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/general/RepairRules", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "RepairRules",
        (i = class {
          readIni(e) {
            return (
              (this.reloadRate = e.getNumber("ReloadRate")),
              (this.repairPercent = e.getNumber("RepairPercent")),
              (this.repairRate = e.getNumber("RepairRate")),
              (this.repairStep = e.getNumber("RepairStep")),
              (this.uRepairRate = e.getNumber("URepairRate")),
              (this.iRepairRate = e.getNumber("IRepairRate")),
              (this.iRepairStep = e.getNumber("IRepairStep")),
              this
            );
          }
        }),
      );
    },
  };
});
