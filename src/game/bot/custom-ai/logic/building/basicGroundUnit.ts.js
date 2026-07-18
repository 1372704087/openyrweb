// === Custom AI module: game/bot/custom-ai/logic/building/basicGroundUnit ===
System.register("game/bot/custom-ai/logic/building/basicGroundUnit", [
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
      var BasicGroundUnit = (function () {
        function BasicGroundUnit(basePriority, baseAmount, antiGroundPower, antiAirPower) {
          this.basePriority = basePriority;
          this.baseAmount = baseAmount;
          this.antiGroundPower = antiGroundPower !== undefined ? antiGroundPower : 1;
          this.antiAirPower = antiAirPower !== undefined ? antiAirPower : 0;
        }
        BasicGroundUnit.prototype.getPlacementLocation = function (game, playerData, technoRules) {
          return undefined;
        };
        BasicGroundUnit.prototype.getPriority = function (game, playerData, technoRules, threatCache) {
          return 0;
        };
        BasicGroundUnit.prototype.getMaxCount = function (game, playerData, technoRules, threatCache) {
          return null;
        };
        return BasicGroundUnit;
      })();
      e("BasicGroundUnit", BasicGroundUnit);
    },
  };
});
