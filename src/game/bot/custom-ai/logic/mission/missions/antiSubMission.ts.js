// === Custom AI module: game/bot/custom-ai/logic/mission/missions/antiSubMission ===
System.register("game/bot/custom-ai/logic/mission/missions/antiSubMission", ["game/api/index", "game/bot/custom-ai/logic/mission/mission", "game/bot/custom-ai/logic/mission/actionBatcher", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/common/utils", "game/bot/custom-ai/logic/common/navalUtils", "game/bot/custom-ai/logic/mission/missionFactories", "game/bot/custom-ai/logic/mission/missionController"], function (e, t) {
  "use strict";
  var ActionsApi, GameApi, OrderType, PlayerData, Vector2, SideType;
  var Mission, requestUnits, noop, disbandMission;
  var ActionBatcher, BatchableAction;
  var DebugLogger, countBy;
  var hasClearWaterLoS, findWaterFiringPoint, pushToPointSafe;
  t && t.id;
  return {
    setters: [
      function (A) {
        ActionsApi = A.ActionsApi;
        GameApi = A.GameApi;
        OrderType = A.OrderType;
        PlayerData = A.PlayerData;
        Vector2 = A.Vector2;
        SideType = A.SideType;
      },
      function (B) {
        Mission = B.Mission;
        requestUnits = B.requestUnits;
        noop = B.noop;
        disbandMission = B.disbandMission;
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
        hasClearWaterLoS = F.hasClearWaterLoS;
        findWaterFiringPoint = F.findWaterFiringPoint;
        pushToPointSafe = F.pushToPointSafe;
      },
      function () {},
      function () {},
    ],
    execute: function () {

      var SIGHT_RADIUS = 12;

      var AntiSubMission = /** @class */ (function (Mission) {
        function AntiSubMission(uniqueName, threatPos, requiredUnits, logger) {
          Mission.call(this, uniqueName, logger);
          this.threatPos = threatPos;
          this.requiredUnits = requiredUnits;
          this.stage = "gather";
        }
        AntiSubMission.prototype = Object.create(Mission.prototype);
        AntiSubMission.prototype.constructor = AntiSubMission;

        AntiSubMission.prototype.getPriority = function () { return 85; };
        AntiSubMission.prototype.isUnitsLocked = function () { return false; };
        AntiSubMission.prototype.getGlobalDebugText = function () { return "AntiSub \u2192 (" + this.threatPos.x + "," + this.threatPos.y + ")"; };

        AntiSubMission.prototype._onAiUpdate = function (gameApi, actionsApi, playerData, matchAwareness, actionBatcher) {
          var hostiles = matchAwareness.getHostilesNearPoint2d(this.threatPos, SIGHT_RADIUS);
          var subsLeft = hostiles.filter(function (_a) {
            var unitId = _a.unitId;
            var u = gameApi.getUnitData(unitId);
            return u && ["SUB", "DLPH", "SQD", "BSUB"].indexOf(u.name) !== -1;
          });
          if (subsLeft.length === 0) return disbandMission();

          var currentComp = countBy(this.getUnitsGameObjectData(gameApi), function (u) { return u.name; });
          var missing = Object.entries(this.requiredUnits).filter(function (_a) {
            var unit = _a[0], need = _a[1];
            return (currentComp[unit] || 0) < need;
          });
          if (missing.length > 0) {
            return requestUnits(missing.map(function (_a) { return _a[0]; }), this.getPriority());
          }

          var squadUnits = this.getUnits(gameApi);

          if (this.stage === "gather") {
            squadUnits.forEach(function (u) { return pushToPointSafe(gameApi, actionBatcher, u.id, OrderType.AttackMove, this.threatPos); }, this);
            var allNear = squadUnits.every(function (u) { return new Vector2(u.tile.rx, u.tile.ry).distanceTo(this.threatPos) <= 4; }, this);
            if (allNear) this.stage = "attack";
            return noop();
          }

          squadUnits.forEach(function (u) {
            var closest = null;
            var minDist = Infinity;
            for (var _i = 0, subsLeft_1 = subsLeft; _i < subsLeft_1.length; _i++) {
              var unitId = subsLeft_1[_i].unitId;
              var d = new Vector2(gameApi.getUnitData(unitId).tile.rx, gameApi.getUnitData(unitId).tile.ry).distanceTo(new Vector2(u.tile.rx, u.tile.ry));
              if (d < minDist) { minDist = d; closest = unitId; }
            }
            if (closest !== null) {
              actionBatcher.push(BatchableAction.toTargetId(u.id, OrderType.Attack, closest));
            }
          });
          return noop();
        };
        return AntiSubMission;
      }(Mission));
      e("AntiSubMission", AntiSubMission);

      var AntiSubMissionFactory = /** @class */ (function () {
        function AntiSubMissionFactory() {}
        AntiSubMissionFactory.prototype.getName = function () { return "AntiSubMissionFactory"; };
        AntiSubMissionFactory.prototype.maybeCreateMissions = function (gameApi, playerData, matchAwareness, missionController, logger) {
          if (missionController.getMissions().some(function (m) { return m instanceof AntiSubMission; })) return;
          var enemySubs = gameApi.getVisibleUnits(playerData.name, "enemy", function (r) { return ["SUB", "DLPH", "SQD", "BSUB"].indexOf(r.name) !== -1; });
          if (enemySubs.length === 0) return;
          var subId = enemySubs[0];
          var data = gameApi.getUnitData(subId);
          if (!data) return;
          var pos = new Vector2(data.tile.rx, data.tile.ry);
          var side = playerData.country ? playerData.country.side : undefined;
          var requiredUnits;
          if (side === SideType.Nod) requiredUnits = { SUB: 2 };
          else if (side === SideType.ThirdSide) requiredUnits = { BSUB: 2 };
          else requiredUnits = { DEST: 1, DLPH: 2 };
          var mission = new AntiSubMission("antiSub_" + gameApi.getCurrentTick(), pos, requiredUnits, logger);
          missionController.addMission(mission);
        };
        AntiSubMissionFactory.prototype.onMissionFailed = function () {};
        return AntiSubMissionFactory;
      }());
      e("AntiSubMissionFactory", AntiSubMissionFactory);
    },
  };
});
