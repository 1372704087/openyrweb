// === Custom AI module: game/bot/custom-ai/logic/building/common ===
System.register("game/bot/custom-ai/logic/building/common", [
  "game/api/index",
  "game/bot/custom-ai/logic/map/map",
  "game/bot/custom-ai/logic/building/buildingRules"
], function (e, t) {
  "use strict";
  var A, M, B;
  t && t.id;
  return {
    setters: [
      function (x) { A = x; },
      function (x) { M = x; },
      function (x) { B = x; },
    ],
    execute: function () {
      var getPointTowardsOtherPoint = M.getPointTowardsOtherPoint;
      var getStaticDefencePlacement = function (game, playerData, technoRules) {
        var startLocation = playerData.startLocation;
        var currentName = playerData.name;
        var allNames = game.getPlayers();
        var candidates = allNames
          .filter(function (otherName) { return otherName !== currentName && !game.areAlliedPlayers(otherName, currentName); })
          .map(function (otherName) {
            var enemyPlayer = game.getPlayerData(otherName);
            return getPointTowardsOtherPoint(game, startLocation, enemyPlayer.startLocation, 4, 16, 1.5);
          });
        if (candidates.length === 0) {
          return undefined;
        }
        var selectedLocation = candidates[Math.floor(game.generateRandom() * candidates.length)];
        return B.getDefaultPlacementLocation(game, playerData, selectedLocation, technoRules, false, 2);
      };
      e("getStaticDefencePlacement", getStaticDefencePlacement);
    },
  };
});
