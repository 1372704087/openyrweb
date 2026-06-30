// === Reconstructed SystemJS module: game/rules/general/ThreatRules ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/general/ThreatRules", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "ThreatRules",
        (i = class {
          readIni(e) {
            return (
              (this.myEffectivenessCoefficientDefault = e.getNumber("MyEffectivenessCoefficientDefault")),
              (this.targetEffectivenessCoefficientDefault = e.getNumber("TargetEffectivenessCoefficientDefault")),
              (this.targetSpecialThreatCoefficientDefault = e.getNumber("TargetSpecialThreatCoefficientDefault")),
              (this.targetStrengthCoefficientDefault = e.getNumber("TargetStrengthCoefficientDefault")),
              (this.targetDistanceCoefficientDefault = e.getNumber("TargetDistanceCoefficientDefault")),
              this
            );
          }
        }),
      );
    },
  };
});
