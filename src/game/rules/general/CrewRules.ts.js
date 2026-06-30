// === Reconstructed SystemJS module: game/rules/general/CrewRules ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/rules/general/CrewRules", [], function (e, t) {
  "use strict";
  var i;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      e(
        "CrewRules",
        (i = class {
          readIni(e) {
            return (
              (this.alliedCrew = e.getString("AlliedCrew")),
              (this.alliedSurvivorDivisor = e.getNumber("AlliedSurvivorDivisor")),
              (this.crewEscape = e.getNumber("CrewEscape")),
              (this.sovietCrew = e.getString("SovietCrew")),
              (this.sovietSurvivorDivisor = e.getNumber("SovietSurvivorDivisor")),
              (this.survivorRate = e.getNumber("SurvivorRate")),
              (this.thirdCrew = e.getString("ThirdCrew")),
              (this.thirdSurvivorDivisor = e.getNumber("ThirdSurvivorDivisor")),
              this
            );
          }
        }),
      );
    },
  };
});
