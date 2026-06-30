// === Reconstructed SystemJS module: game/rules/AiRules ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/AiRules", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "AiRules",
        (i = class {
          readIni(e) {
            ((this.buildPower = e.getArray("BuildPower")),
              (this.buildRefinery = e.getArray("BuildRefinery")),
              (this.buildTech = e.getArray("BuildTech")),
              (this.tiberiumFarScan = e.getNumber("TiberiumFarScan", 50)),
              (this.tiberiumNearScan = e.getNumber("TiberiumNearScan", 5)));
          }
        }),
      );
    },
  };
});
