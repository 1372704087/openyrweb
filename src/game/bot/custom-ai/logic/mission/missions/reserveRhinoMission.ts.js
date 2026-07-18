// === Custom AI module: game/bot/custom-ai/logic/mission/missions/reserveRhinoMission ===
System.register("game/bot/custom-ai/logic/mission/missions/reserveRhinoMission", ["game/api/index", "game/bot/custom-ai/logic/mission/mission", "game/bot/custom-ai/logic/mission/missionFactories", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/mission/missionController", "game/bot/custom-ai/logic/common/utils", "game/bot/custom-ai/logic/mission/actionBatcher"], function (e, t) {
  "use strict";
  var ActionsApi, GameApi, OrderType, PlayerData, Vector2;
  var Mission, requestUnits, noop, disbandMission;
  t && t.id;
  return {
    setters: [
      function (A) {
        ActionsApi = A.ActionsApi;
        GameApi = A.GameApi;
        OrderType = A.OrderType;
        PlayerData = A.PlayerData;
        Vector2 = A.Vector2;
      },
      function (B) {
        Mission = B.Mission;
        requestUnits = B.requestUnits;
        noop = B.noop;
        disbandMission = B.disbandMission;
      },
      function () {},
      function () {},
      function () {},
      function () {},
      function () {},
    ],
    execute: function () {

      var RESERVE_COUNT = 3;
      var RESERVE_PRIORITY = 500;

      var ReserveRhinoMission = /** @class */ (function (Mission) {
        function ReserveRhinoMission(uniqueName, logger) {
          Mission.call(this, uniqueName, logger);
        }
        ReserveRhinoMission.prototype = Object.create(Mission.prototype);
        ReserveRhinoMission.prototype.constructor = ReserveRhinoMission;

        ReserveRhinoMission.prototype.getPriority = function () { return RESERVE_PRIORITY; };
        ReserveRhinoMission.prototype.isUnitsLocked = function () { return false; };
        ReserveRhinoMission.prototype.getGlobalDebugText = function () { return "ReserveRhino"; };

        ReserveRhinoMission.prototype._onAiUpdate = function (gameApi, actionsApi, playerData, matchAwareness, actionBatcher) {
          var rhinosOwned = gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.name === "MTNK"; }).length;
          if (rhinosOwned >= RESERVE_COUNT) {
            return disbandMission();
          }
          var missing = RESERVE_COUNT - rhinosOwned;
          return requestUnits(Array(missing).fill("MTNK"), this.getPriority());
        };
        return ReserveRhinoMission;
      }(Mission));
      e("ReserveRhinoMission", ReserveRhinoMission);

      var ReserveRhinoMissionFactory = /** @class */ (function () {
        function ReserveRhinoMissionFactory() { this.started = false; }
        ReserveRhinoMissionFactory.prototype.getName = function () { return "ReserveRhinoMissionFactory"; };
        ReserveRhinoMissionFactory.prototype.maybeCreateMissions = function (gameApi, playerData, matchAwareness, missionController, logger) {
          if (this.started) return;
          var mission = new ReserveRhinoMission("reserveRhino", logger);
          missionController.addMission(mission);
          this.started = true;
        };
        ReserveRhinoMissionFactory.prototype.onMissionFailed = function () {};
        return ReserveRhinoMissionFactory;
      }());
      e("ReserveRhinoMissionFactory", ReserveRhinoMissionFactory);
    },
  };
});
