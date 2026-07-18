// === Custom AI module: game/bot/custom-ai/logic/building/artilleryUnit ===
System.register("game/bot/custom-ai/logic/building/artilleryUnit", [
  "game/api/index",
  "game/bot/custom-ai/logic/building/buildingRules",
  "game/bot/custom-ai/logic/threat/threat"
], function (e, t) {
  "use strict";
  var A, B, T;
  t && t.id;
  return {
    setters: [
      function (x) { A = x; },
      function (x) { B = x; },
      function (x) { T = x; },
    ],
    execute: function () {
      var AiBuildingRules = B.AiBuildingRules;
      var numBuildingsOwnedOfType = B.numBuildingsOwnedOfType;
      var ArtilleryUnit = class {
        constructor(basePriority, artilleryPower, antiGroundPower, baseAmount) {
          this.basePriority = basePriority;
          this.artilleryPower = artilleryPower;
          this.antiGroundPower = antiGroundPower;
          this.baseAmount = baseAmount;
        }
        getPlacementLocation(game, playerData, technoRules) {
          return undefined;
        }
        getPriority(game, playerData, technoRules, threatCache) {
          return 0;
        }
        getMaxCount(game, playerData, technoRules, threatCache) {
          return null;
        }
      };
      e("ArtilleryUnit", ArtilleryUnit);
    },
  };
});
