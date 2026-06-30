// === Reconstructed SystemJS module: game/rules/general/LightningStormRules ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/general/LightningStormRules", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "LightningStormRules",
        (i = class {
          readIni(e) {
            return (
              (this.deferment = e.getNumber("LightningDeferment")),
              (this.damage = e.getNumber("LightningDamage")),
              (this.duration = e.getNumber("LightningStormDuration")),
              (this.warhead = e.getString("LightningWarhead")),
              (this.hitDelay = e.getNumber("LightningHitDelay")),
              (this.scatterDelay = e.getNumber("LightningScatterDelay")),
              (this.cellSpread = e.getNumber("LightningCellSpread")),
              (this.separation = e.getNumber("LightningSeparation")),
              this
            );
          }
        }),
      );
    },
  };
});
