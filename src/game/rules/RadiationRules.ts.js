// === Reconstructed SystemJS module: game/rules/RadiationRules ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/RadiationRules", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "RadiationRules",
        (i = class {
          readIni(e) {
            ((this.radDurationMultiple = e.getNumber("RadDurationMultiple")),
              (this.radApplicationDelay = e.getNumber("RadApplicationDelay")),
              (this.radLevelMax = e.getNumber("RadLevelMax")),
              (this.radLevelDelay = e.getNumber("RadLevelDelay")),
              (this.radLightDelay = e.getNumber("RadLightDelay")),
              (this.radLevelFactor = e.getNumber("RadLevelFactor")),
              (this.radLightFactor = e.getNumber("RadLightFactor")),
              (this.radTintFactor = e.getNumber("RadTintFactor")),
              (this.radColor = e.getNumberArray("RadColor")),
              (this.radSiteWarhead = e.getString("RadSiteWarhead")));
          }
        }),
      );
    },
  };
});
