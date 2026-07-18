// === Custom AI module: game/bot/custom-ai/logic/map/map ===
System.register("game/bot/custom-ai/logic/map/map", ["game/api/index", "game/bot/custom-ai/logic/common/utils"], function (e, t) {
  "use strict";
  t && t.id;
  var GameMath, Vector2, GameApi, MapApi, PlayerData, Size, Tile, UnitData;
  var maxBy;
  return {
    setters: [
      function (x) { GameMath = x.GameMath; Vector2 = x.Vector2; GameApi = x.GameApi; MapApi = x.MapApi; PlayerData = x.PlayerData; Size = x.Size; Tile = x.Tile; UnitData = x.UnitData; },
      function (x) { maxBy = x.maxBy; }
    ],
    execute: function () {
      var determineMapBounds = function (mapApi) {
        return mapApi.getRealMapSize();
      };
      e("determineMapBounds", determineMapBounds);

      var calculateAreaVisibility = function (mapApi, playerData, startPoint, endPoint) {
        var validTiles = 0, visibleTiles = 0;
        for (var xx = startPoint.x; xx < endPoint.x; ++xx) {
          for (var yy = startPoint.y; yy < endPoint.y; ++yy) {
            var tile = mapApi.getTile(xx, yy);
            if (tile) {
              ++validTiles;
              if (mapApi.isVisibleTile(tile, playerData.name)) {
                ++visibleTiles;
              }
            }
          }
        }
        return { visibleTiles: visibleTiles, validTiles: validTiles };
      };
      e("calculateAreaVisibility", calculateAreaVisibility);

      var getPointTowardsOtherPoint = function (gameApi, startLocation, endLocation, minRadius, maxRadius, randomAngle) {
        var radius = minRadius + Math.round(gameApi.generateRandom() * (maxRadius - minRadius));
        var directionToEndLocation = GameMath.atan2(endLocation.y - startLocation.y, endLocation.x - startLocation.x);
        var randomisedDirection =
          directionToEndLocation -
          (randomAngle * (Math.PI / 12) + 2 * randomAngle * gameApi.generateRandom() * (Math.PI / 12));
        var candidatePointX = Math.round(startLocation.x + GameMath.cos(randomisedDirection) * radius);
        var candidatePointY = Math.round(startLocation.y + GameMath.sin(randomisedDirection) * radius);
        return new Vector2(candidatePointX, candidatePointY);
      };
      e("getPointTowardsOtherPoint", getPointTowardsOtherPoint);

      var getDistanceBetweenPoints = function (startLocation, endLocation) {
        return startLocation.distanceTo(endLocation);
      };
      e("getDistanceBetweenPoints", getDistanceBetweenPoints);

      var getDistanceBetweenTileAndPoint = function (tile, vector) {
        return new Vector2(tile.rx, tile.ry).distanceTo(vector);
      };
      e("getDistanceBetweenTileAndPoint", getDistanceBetweenTileAndPoint);

      var getDistanceBetweenUnits = function (unit1, unit2) {
        return new Vector2(unit1.tile.rx, unit1.tile.ry).distanceTo(new Vector2(unit2.tile.rx, unit2.tile.ry));
      };
      e("getDistanceBetweenUnits", getDistanceBetweenUnits);

      var getDistanceBetween = function (unit, point) {
        return new Vector2(unit.tile.rx, unit.tile.ry).distanceTo(point);
      };
      e("getDistanceBetween", getDistanceBetween);
    },
  };
});
