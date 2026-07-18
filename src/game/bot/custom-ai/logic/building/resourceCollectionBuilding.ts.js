// === Custom AI module: game/bot/custom-ai/logic/building/resourceCollectionBuilding ===
System.register("game/bot/custom-ai/logic/building/resourceCollectionBuilding", [
  "game/api/index",
  "game/bot/custom-ai/logic/threat/threat",
  "game/bot/custom-ai/logic/building/basicBuilding",
  "game/bot/custom-ai/logic/building/buildingRules",
  "game/math/Vector2"
], function (e, t) {
  "use strict";
  var A, T, BB, B, V;
  t && t.id;
  return {
    setters: [
      function (x) { A = x; },
      function (x) { T = x; },
      function (x) { BB = x; },
      function (x) { B = x; },
      function (x) { V = x; },
    ],
    execute: function () {
      var BasicBuilding = BB.BasicBuilding;
      var Vector2 = V.Vector2;
      var ResourceCollectionBuilding = (function (Parent) {
        function ResourceCollectionBuilding(basePriority, maxNeeded, onlyBuildWhenFloatingCreditsAmount) {
          Parent.call(this, basePriority, maxNeeded, onlyBuildWhenFloatingCreditsAmount);
        }
        ResourceCollectionBuilding.prototype = Object.create(Parent.prototype);
        ResourceCollectionBuilding.prototype.constructor = ResourceCollectionBuilding;
        ResourceCollectionBuilding.prototype.getPlacementLocation = function (game, playerData, technoRules) {
          var selectedLocation = playerData.startLocation;
          var closeOre;
          var closeOreDist;
          var allTileResourceData = game.mapApi.getAllTilesResourceData();
          for (var i = 0; i < allTileResourceData.length; ++i) {
            var tileResourceData = allTileResourceData[i];
            if (tileResourceData.spawnsOre) {
              var dist = A.GameMath.sqrt(
                (selectedLocation.x - tileResourceData.tile.rx) * (selectedLocation.x - tileResourceData.tile.rx) +
                (selectedLocation.y - tileResourceData.tile.ry) * (selectedLocation.y - tileResourceData.tile.ry)
              );
              if (closeOreDist === undefined || dist < closeOreDist) {
                closeOreDist = dist;
                closeOre = tileResourceData.tile;
              }
            }
          }
          if (closeOre) {
            selectedLocation = new Vector2(closeOre.rx, closeOre.ry);
          }
          return B.getDefaultPlacementLocation(game, playerData, selectedLocation, technoRules);
        };
        ResourceCollectionBuilding.prototype.getMaxCount = function (game, playerData, technoRules, threatCache) {
          var harvesters = game.getVisibleUnits(playerData.name, "self", function (r) { return r.harvester; }).length;
          return Math.max(1, harvesters * 2);
        };
        return ResourceCollectionBuilding;
      }(BasicBuilding));
      e("ResourceCollectionBuilding", ResourceCollectionBuilding);
    },
  };
});
