// === Custom AI module: game/bot/custom-ai/logic/building/antiGroundStaticDefence ===
System.register("game/bot/custom-ai/logic/building/antiGroundStaticDefence", [
  "game/api/index",
  "game/bot/custom-ai/logic/map/map",
  "game/bot/custom-ai/logic/threat/threat",
  "game/bot/custom-ai/logic/building/buildingRules",
  "game/bot/custom-ai/logic/building/common"
], function (e, t) {
  "use strict";
  var A, M, T, B, C;
  t && t.id;
  return {
    setters: [
      function (x) { A = x; },
      function (x) { M = x; },
      function (x) { T = x; },
      function (x) { B = x; },
      function (x) { C = x; },
    ],
    execute: function () {
      var getStaticDefencePlacement = C.getStaticDefencePlacement;
      var AntiGroundStaticDefence = class {
        constructor(basePriority, baseAmount, groundStrength, limit) {
          this.basePriority = basePriority;
          this.baseAmount = baseAmount;
          this.groundStrength = groundStrength;
          this.limit = limit;
        }
        getPlacementLocation(game, playerData, technoRules) {
          return getStaticDefencePlacement(game, playerData, technoRules);
        }
        getPriority(game, playerData, technoRules, threatCache) {
          var numOwned = B.numBuildingsOwnedOfType(game, playerData, technoRules);
          if (numOwned >= this.limit) {
            return 0;
          }
          if (threatCache) {
            var denominator = threatCache.totalAvailableAntiGroundFirepower + threatCache.totalDefensivePower + this.groundStrength;
            if (threatCache.totalOffensiveLandThreat > denominator * 1.1) {
              return this.basePriority * (threatCache.totalOffensiveLandThreat / Math.max(1, denominator));
            } else {
              return 0;
            }
          }
          var strengthPerCost = (this.groundStrength / technoRules.cost) * 1000;
          return this.basePriority * (1.0 - numOwned / this.baseAmount) * strengthPerCost;
        }
        getMaxCount(game, playerData, technoRules, threatCache) {
          return null;
        }
      };
      e("AntiGroundStaticDefence", AntiGroundStaticDefence);
    },
  };
});
