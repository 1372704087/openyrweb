// === Custom AI module: game/bot/custom-ai/logic/mission/missions/antiCoastShipMission ===
System.register("game/bot/custom-ai/logic/mission/missions/antiCoastShipMission", ["game/api/index", "game/bot/custom-ai/logic/mission/mission", "game/bot/custom-ai/logic/mission/actionBatcher", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/common/utils", "game/bot/custom-ai/logic/common/navalUtils", "game/bot/custom-ai/logic/mission/missionFactories", "game/bot/custom-ai/logic/mission/missionController"], function (e, t) {
  "use strict";
  var ActionsApi, GameApi, OrderType, PlayerData, Vector2, LandType, SpeedType, MovementZone;
  var Mission, requestUnits, noop, disbandMission, grabCombatants;
  var ActionBatcher, BatchableAction;
  var DebugLogger, countBy;
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
        LandType = A.LandType;
        SpeedType = A.SpeedType;
        MovementZone = A.MovementZone;
      },
      function (B) {
        Mission = B.Mission;
        requestUnits = B.requestUnits;
        noop = B.noop;
        disbandMission = B.disbandMission;
        grabCombatants = B.grabCombatants;
      },
      function (C) {
        ActionBatcher = C.ActionBatcher;
        BatchableAction = C.BatchableAction;
      },
      function () {},
      function (E) {
        DebugLogger = E.DebugLogger;
        countBy = E.countBy;
      },
      function (F) {
        pushToPointSafe = F.pushToPointSafe;
      },
      function () {},
      function () {},
    ],
    execute: function () {

      var AntiCoastShipMission = /** @class */ (function (Mission) {
        function AntiCoastShipMission(uniqueName, targetId, targetPos, logger) {
          Mission.call(this, uniqueName, logger);
          this.targetId = targetId;
          this.targetPos = targetPos;
          this.requiredUnits = { MTNK: 3 };
          this.stage = "gather";
        }
        AntiCoastShipMission.prototype = Object.create(Mission.prototype);
        AntiCoastShipMission.prototype.constructor = AntiCoastShipMission;

        AntiCoastShipMission.prototype.getPriority = function () { return 500; };
        AntiCoastShipMission.prototype.isUnitsLocked = function () { return false; };
        AntiCoastShipMission.prototype.getGlobalDebugText = function () { return "AntiCoast \u2192 DEST#" + this.targetId; };

        AntiCoastShipMission.prototype._onAiUpdate = function (gameApi, actionsApi, playerData, matchAwareness, actionBatcher) {
          var destData = gameApi.getUnitData(this.targetId);
          if (!destData) return disbandMission();
          this.targetPos.set(destData.tile.rx, destData.tile.ry);

          var currentComp = countBy(this.getUnitsGameObjectData(gameApi), function (u) { return u.name; });
          var missing = Object.entries(this.requiredUnits).filter(function (_a) {
            var unit = _a[0], want = _a[1];
            return (currentComp[unit] || 0) < want;
          });
          if (missing.length > 0) {
            return grabCombatants(playerData.startLocation, this.getPriority());
          }

          var squadUnits = this.getUnits(gameApi);
          if (this.stage === "gather") {
            var rally = playerData.startLocation;
            var allClose = squadUnits.every(function (u) { return new Vector2(u.tile.rx, u.tile.ry).distanceTo(rally) <= 4; });
            if (!allClose) {
              squadUnits.forEach(function (u) { return pushToPointSafe(gameApi, actionBatcher, u.id, OrderType.Move, rally); });
              return noop();
            }
            this.stage = "attack";
          }

          squadUnits.forEach(function (u) {
            pushToPointSafe(gameApi, actionBatcher, u.id, OrderType.AttackMove, this.targetPos);
          }, this);
          return noop();
        };
        return AntiCoastShipMission;
      }(Mission));
      e("AntiCoastShipMission", AntiCoastShipMission);

      var AntiCoastShipMissionFactory = /** @class */ (function () {
        function AntiCoastShipMissionFactory() {}
        AntiCoastShipMissionFactory.prototype.getName = function () { return "AntiCoastShipMissionFactory"; };
        AntiCoastShipMissionFactory.prototype.maybeCreateMissions = function (gameApi, playerData, matchAwareness, missionController, logger) {
          if (missionController.getMissions().some(function (m) { return m instanceof AntiCoastShipMission; })) return;
          var COAST_THREAT_UNITS = ["DEST", "AEGIS", "CARRIER", "DRED", "HYD"];
          var coastThreats = gameApi.getVisibleUnits(playerData.name, "enemy", function (r) { return COAST_THREAT_UNITS.indexOf(r.name) !== -1; })
            .filter(function (id) {
              var u = gameApi.getUnitData(id);
              if (!u) return false;
              if (u.rules.movementZone !== MovementZone.Water) return false;
              try {
                var startTile = gameApi.mapApi.getTile(playerData.startLocation.x, playerData.startLocation.y);
                var targetTile = gameApi.mapApi.getTile(u.tile.rx, u.tile.ry);
                if (!startTile || !targetTile) return false;
                var path = gameApi.mapApi.findPath(SpeedType.Track, false, { tile: startTile, onBridge: false }, { tile: targetTile, onBridge: false });
                if (!path || path.length === 0) return false;
                var endNode = path[0];
                var distEnd = new Vector2(endNode.tile.rx, endNode.tile.ry).distanceTo(new Vector2(u.tile.rx, u.tile.ry));
                return distEnd <= 6;
              } catch (err) { return false; }
            });
          if (coastThreats.length === 0) return;
          var destId = coastThreats[0];
          var destData = gameApi.getUnitData(destId);
          if (!destData) return;
          var pos = new Vector2(destData.tile.rx, destData.tile.ry);
          var mission = new AntiCoastShipMission("antiCoast_" + gameApi.getCurrentTick(), destId, pos, logger);
          missionController.addMission(mission);
        };
        AntiCoastShipMissionFactory.prototype.onMissionFailed = function () {};
        return AntiCoastShipMissionFactory;
      }());
      e("AntiCoastShipMissionFactory", AntiCoastShipMissionFactory);
    },
  };
});
