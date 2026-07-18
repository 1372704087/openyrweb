// === Custom AI module: game/bot/custom-ai/logic/building/buildingRules ===
System.register("game/bot/custom-ai/logic/building/buildingRules", [
  "game/api/index",
  "game/bot/custom-ai/logic/threat/threat",
  "game/bot/custom-ai/logic/building/antiGroundStaticDefence",
  "game/bot/custom-ai/logic/building/artilleryUnit",
  "game/bot/custom-ai/logic/building/basicAirUnit",
  "game/bot/custom-ai/logic/building/basicBuilding",
  "game/bot/custom-ai/logic/building/basicGroundUnit",
  "game/bot/custom-ai/logic/building/powerPlant",
  "game/bot/custom-ai/logic/building/resourceCollectionBuilding",
  "game/bot/custom-ai/logic/building/harvester",
  "game/bot/custom-ai/logic/building/antiAirStaticDefence",
  "game/bot/custom-ai/logic/building/navalYard",
  "game/bot/custom-ai/logic/building/basicNavalUnit",
  "game/bot/custom-ai/logic/common/utils"
], function (e, t) {
  "use strict";
  var A, T, AntiGround, Artillery, BasicAir, BasicBuild, BasicGround, Power, ResourceColl, Harv, AntiAir, NavalYardMod, BasicNaval, Utils;
  t && t.id;
  return {
    setters: [
      function (x) { A = x; },
      function (x) { T = x; },
      function (x) { AntiGround = x; },
      function (x) { Artillery = x; },
      function (x) { BasicAir = x; },
      function (x) { BasicBuild = x; },
      function (x) { BasicGround = x; },
      function (x) { Power = x; },
      function (x) { ResourceColl = x; },
      function (x) { Harv = x; },
      function (x) { AntiAir = x; },
      function (x) { NavalYardMod = x; },
      function (x) { BasicNaval = x; },
      function (x) { Utils = x; },
    ],
    execute: function () {
      var GameMath = A.GameMath;
      var LandType = A.LandType;
      var ObjectType = A.ObjectType;
      var Vector2 = A.Vector2;
      var GlobalThreat = T.GlobalThreat;
      var uniqBy = Utils.uniqBy;

      e("numBuildingsOwnedOfType", function (game, playerData, technoRules) {
        return game.getVisibleUnits(playerData.name, "self", function (r) { return r == technoRules; }).length;
      });

      e("numBuildingsOwnedOfName", function (game, playerData, name) {
        return game.getVisibleUnits(playerData.name, "self", function (r) { return r.name === name; }).length;
      });

      function computeAdjacentRect(point, t, adjacent, newBuildingSize) {
        return {
          x: point.x - adjacent - (newBuildingSize ? newBuildingSize.width : 0),
          y: point.y - adjacent - (newBuildingSize ? newBuildingSize.height : 0),
          width: t.width + 2 * adjacent + (newBuildingSize ? newBuildingSize.width : 0),
          height: t.height + 2 * adjacent + (newBuildingSize ? newBuildingSize.height : 0),
        };
      }

      function getAdjacentTiles(game, range, onWater) {
        return game.mapApi
          .getTilesInRect(range)
          .filter(function (tile) { return !onWater || tile.landType === LandType.Water; });
      }

      var getAdjacencyTiles = function (game, playerData, technoRules, onWater, minimumSpace) {
        var placementRules = game.getBuildingPlacementData(technoRules.name);
        var newBuildingWidth = placementRules.foundation.width;
        var newBuildingHeight = placementRules.foundation.height;
        var tiles = [];
        var buildings = game.getVisibleUnits(playerData.name, "self", function (r) { return r.type === ObjectType.Building; });
        var removedTiles = {};
        for (var bi = 0; bi < buildings.length; bi++) {
          var buildingId = buildings[bi];
          var building = game.getUnitData(buildingId);
          if (!(building && building.rules && building.rules.baseNormal)) continue;
          var foundation = building.foundation;
          var tile = building.tile;
          var buildingBase = new Vector2(tile.rx, tile.ry);
          var buildingSize = { width: foundation ? foundation.width : 0, height: foundation ? foundation.height : 0 };
          var range = computeAdjacentRect(buildingBase, buildingSize, technoRules.adjacent, placementRules.foundation);
          var adjacentTiles = getAdjacentTiles(game, range, onWater);
          if (adjacentTiles.length === 0) continue;
          for (var at = 0; at < adjacentTiles.length; at++) tiles.push(adjacentTiles[at]);
          var modifiedBase = new Vector2(
            buildingBase.x - (newBuildingWidth - 1),
            buildingBase.y - (newBuildingHeight - 1)
          );
          var modifiedSize = {
            width: buildingSize.width + (newBuildingWidth - 1),
            height: buildingSize.height + (newBuildingHeight - 1),
          };
          var blockedRect = computeAdjacentRect(modifiedBase, modifiedSize, minimumSpace);
          for (var bt = 0; bt < adjacentTiles.length; bt++) {
            var bTile = adjacentTiles[bt];
            if (
              bTile.rx >= blockedRect.x &&
              bTile.rx < blockedRect.x + blockedRect.width &&
              bTile.ry >= blockedRect.y &&
              bTile.ry < blockedRect.y + blockedRect.height
            ) {
              removedTiles[bTile.id] = true;
            }
          }
        }
        var withDuplicatesRemoved = uniqBy(tiles, function (tile) { return tile.id; });
        return withDuplicatesRemoved.filter(function (tile) { return !removedTiles[tile.id]; });
      };
      e("getAdjacencyTiles", getAdjacencyTiles);

      function getTileDistances(startPoint, tiles) {
        return tiles
          .map(function (tile) {
            return {
              tile: tile,
              distance: distance(tile.rx, tile.ry, startPoint.x, startPoint.y),
            };
          })
          .sort(function (a, b) { return a.distance - b.distance; });
      }

      function distance(x1, y1, x2, y2) {
        var dx = x1 - x2;
        var dy = y1 - y2;
        var tmp = dx * dx + dy * dy;
        if (tmp === 0) return 0;
        return GameMath.sqrt(tmp);
      }

      e("getDefaultPlacementLocation", function (game, playerData, idealPoint, technoRules, onWater, minSpace) {
        if (onWater === undefined) onWater = false;
        if (minSpace === undefined) minSpace = 1;
        var size = game.getBuildingPlacementData(technoRules.name);
        if (!size) return undefined;
        var tiles = getAdjacencyTiles(game, playerData, technoRules, onWater, minSpace);
        var tileDistances = getTileDistances(idealPoint, tiles);
        for (var ti = 0; ti < tileDistances.length; ti++) {
          var td = tileDistances[ti];
          if (td.tile && game.canPlaceBuilding(playerData.name, technoRules.name, td.tile)) {
            return td.tile;
          }
        }
        return undefined;
      });

      e("DEFAULT_BUILDING_PRIORITY", 0);

      e("BUILDING_NAME_TO_RULES", new Map([
        ["GAPOWR", new Power.PowerPlant()],
        ["GAREFN", new ResourceColl.ResourceCollectionBuilding(10, 3)],
        ["GAWEAP", new BasicBuild.BasicBuilding(15, 5)],
        ["GAPILE", new BasicBuild.BasicBuilding(12, 3)],
        ["CMIN", new Harv.Harvester(15, 4, 2)],
        ["GADEPT", new BasicBuild.BasicBuilding(1, 1, 10000)],
        ["GAAIRC", new BasicBuild.BasicBuilding(10, 1, 500)],
        ["AMRADR", new BasicBuild.BasicBuilding(10, 1, 500)],
        ["GATECH", new BasicBuild.BasicBuilding(20, 1, 4000)],
        ["GAYARD", new NavalYardMod.NavalYard(8, 3, 2000, function (msg, say) {})],
        ["GAPILL", new AntiGround.AntiGroundStaticDefence(2, 1, 5, 8)],
        ["ATESLA", new AntiGround.AntiGroundStaticDefence(2, 1, 10, 4)],
        ["NASAM", new AntiAir.AntiAirStaticDefence(2, 1, 5, 8)],
        ["GAWALL", new AntiGround.AntiGroundStaticDefence(0, 0, 0, 0)],
        ["E1", new BasicGround.BasicGroundUnit(2, 2, 0.2, 0)],
        ["ENGINEER", new BasicGround.BasicGroundUnit(1, 0, 0)],
        ["SPY", new BasicGround.BasicGroundUnit(1, 0, 0)],
        ["MTNK", new BasicGround.BasicGroundUnit(10, 3, 2, 0)],
        ["MGTK", new BasicGround.BasicGroundUnit(10, 1, 2.5, 0)],
        ["FV", new BasicGround.BasicGroundUnit(5, 2, 0.5, 1)],
        ["JUMPJET", new BasicAir.BasicAirUnit(10, 1, 1, 1)],
        ["ORCA", new BasicAir.BasicAirUnit(7, 1, 2, 0)],
        ["SREF", new Artillery.ArtilleryUnit(10, 5, 3, 3)],
        ["CLEG", new BasicGround.BasicGroundUnit(0, 0)],
        ["SHAD", new BasicGround.BasicGroundUnit(0, 0)],
        ["NAPOWR", new Power.PowerPlant()],
        ["NAREFN", new ResourceColl.ResourceCollectionBuilding(10, 3)],
        ["NAWEAP", new BasicBuild.BasicBuilding(15, 5)],
        ["NAHAND", new BasicBuild.BasicBuilding(12, 3)],
        ["HARV", new Harv.Harvester(15, 4, 2)],
        ["NADEPT", new BasicBuild.BasicBuilding(1, 1, 10000)],
        ["NARADR", new BasicBuild.BasicBuilding(10, 1, 500)],
        ["NANRCT", new Power.PowerPlant()],
        ["NAYARD", new NavalYardMod.NavalYard(8, 3, 2000, function (msg, say) {})],
        ["NATECH", new BasicBuild.BasicBuilding(20, 1, 4000)],
        ["NALASR", new AntiGround.AntiGroundStaticDefence(2, 1, 5, 8)],
        ["NAFLAK", new AntiAir.AntiAirStaticDefence(2, 1, 5, 8)],
        ["TESLA", new AntiGround.AntiGroundStaticDefence(2, 1, 10, 4)],
        ["NAWALL", new AntiGround.AntiGroundStaticDefence(0, 0, 0, 0)],
        ["E2", new BasicGround.BasicGroundUnit(2, 2, 0.2, 0)],
        ["SENGINEER", new BasicGround.BasicGroundUnit(1, 0, 0)],
        ["FLAKT", new BasicGround.BasicGroundUnit(2, 2, 0.1, 0.3)],
        ["DOG", new BasicGround.BasicGroundUnit(1, 1, 0, 0)],
        ["HTNK", new BasicGround.BasicGroundUnit(10, 3, 3, 0)],
        ["APOC", new BasicGround.BasicGroundUnit(6, 1, 5, 0)],
        ["HTK", new BasicGround.BasicGroundUnit(5, 2, 0.33, 1.5)],
        ["ZEP", new BasicAir.BasicAirUnit(5, 1, 5, 1)],
        ["V3", new Artillery.ArtilleryUnit(9, 10, 0, 3)],
        ["DEST", new BasicNaval.BasicNavalUnit(10, 4, 2, 0, 1)],
        ["AEGIS", new BasicNaval.BasicNavalUnit(8, 0, 0, 6, 0)],
        ["CARRIER", new BasicNaval.BasicNavalUnit(15, 1, 2, 1, 1)],
        ["DLPH", new BasicNaval.BasicNavalUnit(5, 2, 0, 0, 2)],
        ["SUB", new BasicNaval.BasicNavalUnit(10, 4, 0, 0, 4)],
        ["HYD", new BasicNaval.BasicNavalUnit(8, 6, 0.5, 3, 0)],
        ["DRED", new BasicNaval.BasicNavalUnit(15, 1, 10, 0, 1)],
        ["SQD", new BasicNaval.BasicNavalUnit(5, 2, 0, 0, 5)],
        // ——— 尤里阵营 ———
        ["YAPOWR", new Power.PowerPlant()],
        ["YAREFN", new ResourceColl.ResourceCollectionBuilding(10, 3)],
        ["YAWEAP", new BasicBuild.BasicBuilding(15, 5)],
        ["YABRCK", new BasicBuild.BasicBuilding(12, 3)],
        ["NATBNK", new Power.PowerPlant()],
        ["YATECH", new BasicBuild.BasicBuilding(20, 1, 4000)],
        ["YAYARD", new NavalYardMod.NavalYard(8, 3, 2000, function (msg, say) {})],
        ["NAPSIS", new BasicBuild.BasicBuilding(10, 1, 500)],
        ["BSUB", new BasicNaval.BasicNavalUnit(12, 2, 8, 0, 4)],
        ["YHVR", new BasicNaval.BasicNavalUnit(4, 2, 0, 0, 0)],
        ["YAPSID", new AntiGround.AntiGroundStaticDefence(2, 1, 5, 8)],
        ["YAGRND", new AntiAir.AntiAirStaticDefence(2, 1, 5, 8)],
        ["YAGAP", new AntiGround.AntiGroundStaticDefence(0, 0, 0, 0)],
        ["YAPSY", new AntiGround.AntiGroundStaticDefence(2, 1, 10, 4)],
        ["INIT", new BasicGround.BasicGroundUnit(2, 2, 0.2, 0)],
        ["BRUTE", new BasicGround.BasicGroundUnit(3, 2, 0.3, 0)],
        ["TELE", new BasicGround.BasicGroundUnit(5, 2, 2, 0)],
        ["LTNK", new BasicGround.BasicGroundUnit(10, 3, 2, 0)],
        ["YTNK", new BasicGround.BasicGroundUnit(8, 2, 1.5, 0.5)],
        ["MIND", new BasicGround.BasicGroundUnit(10, 1, 3, 0)],
      ]));
    },
  };
});
