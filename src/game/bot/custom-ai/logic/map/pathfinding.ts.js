// === Custom AI module: game/bot/custom-ai/logic/map/pathfinding ===
System.register("game/bot/custom-ai/logic/map/pathfinding", ["game/api/index"], function (e, t) {
  "use strict";
  t && t.id;
  var GameApi, Vector2, SpeedType;
  return {
    setters: [
      function (x) { GameApi = x.GameApi; Vector2 = x.Vector2; SpeedType = x.SpeedType; }
    ],
    execute: function () {
      var isPointReachable = function (gameApi, startPoint, targetPoint, speedType, maxAllowedError, considerUnitAboveCeiling) {
        maxAllowedError = maxAllowedError !== undefined ? maxAllowedError : 1;
        considerUnitAboveCeiling = considerUnitAboveCeiling !== undefined ? considerUnitAboveCeiling : false;

        var startTile = gameApi.mapApi.getTile(startPoint.x, startPoint.y);
        var targetTile = gameApi.mapApi.getTile(targetPoint.x, targetPoint.y);

        if (!startTile || !targetTile) {
          return false;
        }

        var path = gameApi.mapApi.findPath(
          speedType,
          considerUnitAboveCeiling,
          { tile: startTile, onBridge: false },
          { tile: targetTile, onBridge: false }
        );

        if (!path || path.length === 0) {
          return false;
        }

        var pathEndPoint = path[0].tile;
        var endPointDistance = new Vector2(pathEndPoint.rx, pathEndPoint.ry).distanceTo(targetPoint);

        return endPointDistance <= maxAllowedError;
      };
      e("isPointReachable", isPointReachable);
    },
  };
});
