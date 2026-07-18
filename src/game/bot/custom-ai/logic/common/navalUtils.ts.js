// === Custom AI module: game/bot/custom-ai/logic/common/navalUtils ===
System.register("game/bot/custom-ai/logic/common/navalUtils", ["game/api/index", "game/bot/custom-ai/logic/mission/actionBatcher"], function (e, t) {
  "use strict";
  t && t.id;
  var LandType, OrderType, Vector2;
  var ActionBatcher, BatchableAction;
  return {
    setters: [
      function (x) { LandType = x.LandType; OrderType = x.OrderType; Vector2 = x.Vector2; },
      function (x) { ActionBatcher = x.ActionBatcher; BatchableAction = x.BatchableAction; }
    ],
    execute: function () {
      var hasClearWaterLoS = function (gameApi, from, to, corridorHalfWidth) {
        corridorHalfWidth = corridorHalfWidth !== undefined ? corridorHalfWidth : 1;
        var dx = to.x - from.x;
        var dy = to.y - from.y;
        var steps = Math.max(Math.abs(dx), Math.abs(dy));
        if (steps === 0) return true;

        for (var i = 0; i <= steps; i++) {
          var cx = Math.round(from.x + (dx * i) / steps);
          var cy = Math.round(from.y + (dy * i) / steps);

          for (var ox = -corridorHalfWidth; ox <= corridorHalfWidth; ox++) {
            for (var oy = -corridorHalfWidth; oy <= corridorHalfWidth; oy++) {
              var tx = cx + ox;
              var ty = cy + oy;
              var tile = gameApi.mapApi.getTile(tx, ty);
              if (!tile) return false;
              if ((tile.landType !== LandType.Clear && tile.landType !== LandType.Water) || tile.onBridgeLandType !== undefined) {
                return false;
              }
            }
          }
        }
        return true;
      };
      e("hasClearWaterLoS", hasClearWaterLoS);

      var findWaterFiringPoint = function (gameApi, targetPos, radiusMin, radiusMax, attempts) {
        attempts = attempts !== undefined ? attempts : 10;
        for (var attempt = 0; attempt < attempts; attempt++) {
          var ang = gameApi.generateRandom() * Math.PI * 2;
          var radius = radiusMin + gameApi.generateRandom() * (radiusMax - radiusMin);
          var dest = targetPos.add(
            new Vector2(Math.round(Math.cos(ang) * radius), Math.round(Math.sin(ang) * radius))
          );
          var tile = gameApi.mapApi.getTile(dest.x, dest.y);
          if (!tile) continue;
          if (tile.landType !== LandType.Water || tile.onBridgeLandType !== undefined) continue;
          if (!hasClearWaterLoS(gameApi, dest, targetPos)) continue;
          return dest;
        }
        return null;
      };
      e("findWaterFiringPoint", findWaterFiringPoint);

      var pushToPointSafe = function (gameApi, actionBatcher, unitId, orderType, point) {
        if (gameApi.mapApi.getTile(point.x, point.y)) {
          actionBatcher.push(BatchableAction.toPoint(unitId, orderType, point));
        }
      };
      e("pushToPointSafe", pushToPointSafe);
    },
  };
});
