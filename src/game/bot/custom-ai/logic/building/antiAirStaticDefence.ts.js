// === Custom AI module: game/bot/custom-ai/logic/building/antiAirStaticDefence ===
System.register("game/bot/custom-ai/logic/building/antiAirStaticDefence", [
  "game/api/index",
  "game/bot/custom-ai/logic/map/map",
  "game/bot/custom-ai/logic/threat/threat",
  "game/bot/custom-ai/logic/building/buildingRules"
], function (e, t) {
  "use strict";
  var A, M, T, B;
  t && t.id;
  return {
    setters: [
      function (x) { A = x; },
      function (x) { M = x; },
      function (x) { T = x; },
      function (x) { B = x; },
    ],
    execute: function () {
      var getPointTowardsOtherPoint = M.getPointTowardsOtherPoint;
      var AntiAirStaticDefence = class {
        constructor(basePriority, baseAmount, airStrength, maxCount) {
          this.basePriority = basePriority;
          this.baseAmount = baseAmount;
          this.airStrength = airStrength;
          this.maxCount = maxCount !== undefined ? maxCount : null;
        }
        getPlacementLocation(game, playerData, technoRules) {
          var startLocation = playerData.startLocation;
          var players = game.getPlayers();
          var enemyFacingLocationCandidates = [];
          for (var i = 0; i < players.length; ++i) {
            var playerName = players[i];
            if (playerName == playerData.name) {
              continue;
            }
            var enemyPlayer = game.getPlayerData(playerName);
            enemyFacingLocationCandidates.push(
              getPointTowardsOtherPoint(game, startLocation, enemyPlayer.startLocation, 4, 16, 1.5)
            );
          }
          var selectedLocation = enemyFacingLocationCandidates[Math.floor(game.generateRandom() * enemyFacingLocationCandidates.length)];
          return B.getDefaultPlacementLocation(game, playerData, selectedLocation, technoRules, false, 0);
        }
        getPriority(game, playerData, technoRules, threatCache) {
          var numOwned = B.numBuildingsOwnedOfType(game, playerData, technoRules);
          if (this.maxCount !== null && numOwned >= this.maxCount) {
            return 0;
          }
          if (threatCache) {
            var denominator = threatCache.totalAvailableAntiAirFirepower + this.airStrength;
            if (threatCache.totalOffensiveAirThreat > denominator * 1.1) {
              return this.basePriority * (threatCache.totalOffensiveAirThreat / Math.max(1, denominator));
            } else {
              return 0;
            }
          }
          var strengthPerCost = (this.airStrength / technoRules.cost) * 1000;
          return this.basePriority * (1.0 - numOwned / this.baseAmount) * strengthPerCost;
        }
        getMaxCount(game, playerData, technoRules, threatCache) {
          return null;
        }
      };
      e("AntiAirStaticDefence", AntiAirStaticDefence);
    },
  };
});
