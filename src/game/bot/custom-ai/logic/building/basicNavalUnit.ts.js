// === Custom AI module: game/bot/custom-ai/logic/building/basicNavalUnit ===
System.register("game/bot/custom-ai/logic/building/basicNavalUnit", [
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
      var BasicNavalUnit = class {
        constructor(basePriority, baseAmount, antiGroundPower, antiAirPower, antiNavalPower) {
          this.basePriority = basePriority;
          this.baseAmount = baseAmount;
          this.antiGroundPower = antiGroundPower !== undefined ? antiGroundPower : 1;
          this.antiAirPower = antiAirPower !== undefined ? antiAirPower : 0;
          this.antiNavalPower = antiNavalPower !== undefined ? antiNavalPower : 1;
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
      e("BasicNavalUnit", BasicNavalUnit);
    },
  };
});
