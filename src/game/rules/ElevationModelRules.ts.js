// === Reconstructed SystemJS module: game/rules/ElevationModelRules ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/ElevationModelRules", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "ElevationModelRules",
        (i = class {
          readIni(e) {
            return (
              (this.increment = e.getNumber("ElevationIncrement")),
              (this.incrementBonus = e.getNumber("ElevationIncrementBonus", 1)),
              (this.bonusCap = e.getNumber("ElevationBonusCap")),
              this
            );
          }
          getBonus(e, t) {
            return e <= t ? 0 : Math.min(this.bonusCap, Math.floor((e - t) / this.increment)) * this.incrementBonus;
          }
        }),
      );
    },
  };
});
