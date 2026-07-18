// === Custom AI module: game/bot/custom-ai/logic/mission/missions/retreatMission ===
System.register("game/bot/custom-ai/logic/mission/missions/retreatMission", ["game/bot/custom-ai/logic/common/utils", "game/api/index", "game/bot/custom-ai/logic/mission/mission", "game/bot/custom-ai/logic/mission/actionBatcher", "game/bot/custom-ai/logic/awareness"], function (e, t) {
  "use strict";
  var ActionsApi, GameApi, OrderType, PlayerData, Vector2;
  var Mission, disbandMission, requestSpecificUnits;
  t && t.id;
  return {
    setters: [
      function () {},
      function (B) {
        ActionsApi = B.ActionsApi;
        GameApi = B.GameApi;
        OrderType = B.OrderType;
        PlayerData = B.PlayerData;
        Vector2 = B.Vector2;
      },
      function (C) {
        Mission = C.Mission;
        disbandMission = C.disbandMission;
        requestSpecificUnits = C.requestSpecificUnits;
      },
      function () {},
      function () {},
    ],
    execute: function () {

      var RetreatMission = /** @class */ (function (Mission) {
        function RetreatMission(uniqueName, retreatToPoint, withUnitIds, logger) {
          Mission.call(this, uniqueName, logger);
          this.retreatToPoint = retreatToPoint;
          this.withUnitIds = withUnitIds;
          this.createdAt = null;
        }
        RetreatMission.prototype = Object.create(Mission.prototype);
        RetreatMission.prototype.constructor = RetreatMission;

        RetreatMission.prototype._onAiUpdate = function (gameApi, actionsApi, playerData, matchAwareness, actionBatcher) {
          if (!this.createdAt) {
            this.createdAt = gameApi.getCurrentTick();
          }
          if (this.getUnitIds().length > 0) {
            actionsApi.orderUnits(this.getUnitIds(), OrderType.AttackMove, this.retreatToPoint.x, this.retreatToPoint.y);
            return disbandMission();
          }
          if (this.createdAt && gameApi.getCurrentTick() > this.createdAt + 240) {
            return disbandMission();
          } else {
            return requestSpecificUnits(this.withUnitIds, 1000);
          }
        };
        RetreatMission.prototype.getGlobalDebugText = function () {
          return "retreat with " + this.withUnitIds.length + " units";
        };
        RetreatMission.prototype.getPriority = function () {
          return 100;
        };
        return RetreatMission;
      }(Mission));
      e("RetreatMission", RetreatMission);
    },
  };
});
