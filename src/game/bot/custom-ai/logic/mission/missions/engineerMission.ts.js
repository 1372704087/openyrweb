// === Custom AI module: game/bot/custom-ai/logic/mission/missions/engineerMission ===
System.register("game/bot/custom-ai/logic/mission/missions/engineerMission", ["game/api/index", "game/bot/custom-ai/logic/mission/mission", "game/bot/custom-ai/logic/mission/missionFactories", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/mission/missionController", "game/bot/custom-ai/logic/common/utils", "game/bot/custom-ai/logic/mission/actionBatcher"], function (e, t) {
  "use strict";
  var ActionsApi, GameApi, OrderType, PlayerData, Vector2;
  var Mission, disbandMission, noop, requestUnits;
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
        disbandMission = B.disbandMission;
        noop = B.noop;
        requestUnits = B.requestUnits;
      },
      function () {},
      function () {},
      function () {},
      function () {},
      function () {},
    ],
    execute: function () {

      var CAPTURE_COOLDOWN_TICKS = 120;
      var TARGET_LOST_DISBAND_TICKS = 30;

      var POWER_PLANT_NAMES = ["GAPOWR", "NAPOWR", "NANRCT", "YAPOWR", "NATBNK"];

      function isPowerPlant(rules) {
        if (!rules) return false;
        if (rules.power > 0) return true;
        return POWER_PLANT_NAMES.indexOf(rules.name) !== -1;
      }

      function isHighValueEnemyBuilding(rules) {
        if (!rules) return false;
        if (rules.constructionYard) return true;
        if (rules.weaponsFactory) return true;
        if (rules.refinery) return true;
        return false;
      }

      function getTargetBaseScore(rules) {
        if (!rules) return 0;
        if (rules.constructionYard) return 1000;
        if (rules.weaponsFactory) return 500;
        if (rules.refinery) return 400;
        if (isPowerPlant(rules)) return 300;
        if (rules.produceCashAmount > 0) return 200;
        return 100;
      }

      function distanceSq(x1, y1, x2, y2) {
        var dx = x1 - x2;
        var dy = y1 - y2;
        return dx * dx + dy * dy;
      }

      var EngineerMission = /** @class */ (function (Mission) {
        function EngineerMission(uniqueName, priority, captureTargetId, logger) {
          Mission.call(this, uniqueName, logger);
          this.priority = priority;
          this.captureTargetId = captureTargetId;
          this.hasAttemptedCaptureWith = null;
        }
        EngineerMission.prototype = Object.create(Mission.prototype);
        EngineerMission.prototype.constructor = EngineerMission;

        EngineerMission.prototype._onAiUpdate = function (gameApi, actionsApi, playerData, matchAwareness, actionBatcher) {
          var targetData = gameApi.getGameObjectData(this.captureTargetId);
          if (!targetData || !targetData.rules || !targetData.rules.capturable) {
            if (this.hasAttemptedCaptureWith !== null && gameApi.getCurrentTick() > this.hasAttemptedCaptureWith.gameTick + TARGET_LOST_DISBAND_TICKS) {
              return disbandMission();
            }
          }

          var engineerTypes = ["ENGINEER", "SENGINEER"];
          var engineers = this.getUnitsOfTypes.apply(this, [gameApi].concat(engineerTypes));
          if (engineers.length === 0) {
            if (this.hasAttemptedCaptureWith !== null) {
              return disbandMission();
            }
            return requestUnits(engineerTypes, this.priority);
          } else if (!this.hasAttemptedCaptureWith || gameApi.getCurrentTick() > this.hasAttemptedCaptureWith.gameTick + CAPTURE_COOLDOWN_TICKS) {
            actionsApi.orderUnits(engineers.map(function (e) { return e.id; }), OrderType.Capture, this.captureTargetId);
            this.hasAttemptedCaptureWith = { unitId: engineers[0].id, gameTick: gameApi.getCurrentTick() };
          }
          return noop();
        };
        EngineerMission.prototype.getGlobalDebugText = function () { return undefined; };
        EngineerMission.prototype.getPriority = function () { return this.priority; };
        return EngineerMission;
      }(Mission));
      e("EngineerMission", EngineerMission);

      var MAX_CAPTURE_TARGETS_PER_CHECK = 3;
      var TECH_CHECK_INTERVAL_TICKS = 300;
      var RUSH_MODE_SECONDS = 180;
      var RUSH_PRIORITY = 150;
      var NORMAL_PRIORITY = 100;

      var EngineerMissionFactory = /** @class */ (function () {
        function EngineerMissionFactory() { this.lastCheckAt = 0; }
        EngineerMissionFactory.prototype.getName = function () { return "EngineerMissionFactory"; };
        EngineerMissionFactory.prototype.maybeCreateMissions = function (gameApi, playerData, matchAwareness, missionController, logger) {
          if (!(gameApi.getCurrentTick() > this.lastCheckAt + TECH_CHECK_INTERVAL_TICKS)) return;
          this.lastCheckAt = gameApi.getCurrentTick();

          var self = this;
          var currentTick = gameApi.getCurrentTick();
          var tickRate = gameApi.getTickRate() || 15;
          var elapsedSeconds = currentTick / tickRate;
          var isRushMode = elapsedSeconds < RUSH_MODE_SECONDS;

          var enemyBuildingIds = gameApi.getVisibleUnits(playerData.name, "hostile", function (r) {
            if (!r.capturable) return false;
            if (r.produceCashAmount > 0) return true;
            return isHighValueEnemyBuilding(r) || isPowerPlant(r);
          });

          var targets = enemyBuildingIds
            .map(function (buildingId) {
              var data = gameApi.getGameObjectData(buildingId);
              if (!data || !data.tile) return null;
              var rules = data.rules;
              var score = getTargetBaseScore(rules);
              var distance = distanceSq(playerData.startLocation.x, playerData.startLocation.y, data.tile.rx, data.tile.ry);
              var isRushTarget = rules.constructionYard || isPowerPlant(rules) || rules.refinery;
              return { buildingId: buildingId, score: score, distance: distance, isRushTarget: isRushTarget };
            })
            .filter(function (item) { return item !== null; })
            .sort(function (a, b) {
              if (b.score !== a.score) return b.score - a.score;
              return a.distance - b.distance;
            });

          var activeMissions = missionController.getMissions();
          var createdCount = 0;
          targets.forEach(function (target) {
            if (createdCount >= MAX_CAPTURE_TARGETS_PER_CHECK) return;
            var missionName = "capture-" + target.buildingId;
            var alreadyExists = activeMissions.some(function (m) { return m.getUniqueName() === missionName; });
            if (alreadyExists) return;

            var priority = NORMAL_PRIORITY;
            if (isRushMode && target.isRushTarget) {
              priority = RUSH_PRIORITY;
            }

            missionController.addMission(new EngineerMission(missionName, priority, target.buildingId, logger));
            createdCount++;
          });
        };
        EngineerMissionFactory.prototype.onMissionFailed = function () {};
        return EngineerMissionFactory;
      }());
      e("EngineerMissionFactory", EngineerMissionFactory);
    },
  };
});
