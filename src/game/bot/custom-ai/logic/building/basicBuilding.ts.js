// === Custom AI module: game/bot/custom-ai/logic/building/basicBuilding ===
System.register("game/bot/custom-ai/logic/building/basicBuilding", [
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
      var BasicBuilding = (function () {
        function BasicBuilding(basePriority, maxNeeded, onlyBuildWhenFloatingCreditsAmount) {
          this.basePriority = basePriority;
          this.maxNeeded = maxNeeded;
          this.onlyBuildWhenFloatingCreditsAmount = onlyBuildWhenFloatingCreditsAmount;
        }
        BasicBuilding.prototype.getPlacementLocation = function (game, playerData, technoRules) {
          return B.getDefaultPlacementLocation(game, playerData, playerData.startLocation, technoRules);
        };
        BasicBuilding.prototype.getPriority = function (game, playerData, technoRules, threatCache) {
          var numOwned = B.numBuildingsOwnedOfType(game, playerData, technoRules);
          var calcMaxCount = this.getMaxCount(game, playerData, technoRules, threatCache);
          if (numOwned >= (calcMaxCount !== null && calcMaxCount !== undefined ? calcMaxCount : this.maxNeeded)) {
            return -100;
          }
          var priority = this.basePriority * (1.0 - numOwned / this.maxNeeded);
          if (this.onlyBuildWhenFloatingCreditsAmount && playerData.credits < this.onlyBuildWhenFloatingCreditsAmount) {
            return priority * (playerData.credits / this.onlyBuildWhenFloatingCreditsAmount);
          }
          return priority;
        };
        BasicBuilding.prototype.getMaxCount = function (game, playerData, technoRules, threatCache) {
          return this.maxNeeded;
        };
        return BasicBuilding;
      })();
      e("BasicBuilding", BasicBuilding);
    },
  };
});
