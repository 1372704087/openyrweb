// === Custom AI module: game/bot/custom-ai/logic/mission/missions/dreadEscortMission ===
System.register("game/bot/custom-ai/logic/mission/missions/dreadEscortMission", ["game/api/index", "game/bot/custom-ai/logic/mission/mission", "game/bot/custom-ai/logic/mission/actionBatcher", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/common/utils", "game/bot/custom-ai/logic/mission/missionFactories", "game/bot/custom-ai/logic/mission/missionController", "game/bot/custom-ai/logic/common/navalUtils"], function (e, t) {
  "use strict";
  var ActionsApi, GameApi, OrderType, PlayerData, Vector2;
  var Mission, requestUnits, noop, disbandMission;
  var countBy;
  var pushToPointSafe;
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
      function (E) {
        countBy = E.countBy;
      },
      function () {},
      function () {},
      function (H) {
        pushToPointSafe = H.pushToPointSafe;
      },
    ],
    execute: function () {

      var ESCORT_SUB_COUNT = 3;
      var ESCORT_PRIORITY = 400;

      var DreadEscortMission = /** @class */ (function (Mission) {
        function DreadEscortMission(uniqueName, dreadId, loggerCtx) {
          Mission.call(this, uniqueName, loggerCtx);
          this.dreadId = dreadId;
          this.loggerCtx = loggerCtx;
        }
        DreadEscortMission.prototype = Object.create(Mission.prototype);
        DreadEscortMission.prototype.constructor = DreadEscortMission;

        DreadEscortMission.prototype.getDreadId = function () { return this.dreadId; };
        DreadEscortMission.prototype.getPriority = function () { return ESCORT_PRIORITY; };
        DreadEscortMission.prototype.isUnitsLocked = function () { return true; };
        DreadEscortMission.prototype.getGlobalDebugText = function () { return "Escort\u2192DRED#" + this.dreadId; };

        DreadEscortMission.prototype._onAiUpdate = function (gameApi, actionsApi, playerData, matchAwareness, actionBatcher) {
          var dread = gameApi.getUnitData(this.dreadId);
          if (!dread) return disbandMission();

          var currentComp = countBy(this.getUnitsGameObjectData(gameApi), function (u) { return u.name; });
          var subCount = currentComp["SUB"] || 0;
          if (subCount < ESCORT_SUB_COUNT) {
            var missing = ESCORT_SUB_COUNT - subCount;
            return requestUnits(Array(missing).fill("SUB"), this.getPriority());
          }

          var dest = new Vector2(dread.tile.rx, dread.tile.ry);
          this.getUnits(gameApi).forEach(function (unit) {
            pushToPointSafe(gameApi, actionBatcher, unit.id, OrderType.AttackMove, dest);
          });
          return noop();
        };
        return DreadEscortMission;
      }(Mission));
      e("DreadEscortMission", DreadEscortMission);

      var DreadEscortMissionFactory = /** @class */ (function () {
        function DreadEscortMissionFactory() {}
        DreadEscortMissionFactory.prototype.getName = function () { return "DreadEscortMissionFactory"; };
        DreadEscortMissionFactory.prototype.maybeCreateMissions = function (gameApi, playerData, matchAwareness, missionController, logger) {
          var dreadIds = gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.name === "DRED"; });
          if (dreadIds.length === 0) return;
          dreadIds.forEach(function (dreadId) {
            var exists = missionController.getMissions().some(function (m) { return m instanceof DreadEscortMission && m.getDreadId() === dreadId; });
            if (!exists) {
              var mission = new DreadEscortMission("escortDred_" + dreadId, dreadId, logger);
              missionController.addMission(mission);
            }
          });
        };
        DreadEscortMissionFactory.prototype.onMissionFailed = function () {};
        return DreadEscortMissionFactory;
      }());
      e("DreadEscortMissionFactory", DreadEscortMissionFactory);
    },
  };
});
