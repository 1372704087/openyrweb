// === Custom AI module: game/bot/custom-ai/logic/mission/missions/spyMission ===
System.register("game/bot/custom-ai/logic/mission/missions/spyMission", ["game/api/index", "game/bot/custom-ai/logic/mission/mission", "game/bot/custom-ai/logic/mission/missionFactories", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/mission/missionController", "game/bot/custom-ai/logic/common/utils", "game/bot/custom-ai/logic/mission/actionBatcher"], function (e, t) {
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

      var APPROACH_DISTANCE = 6;
      var INFILTRATE_COOLDOWN_TICKS = 120;
      var TARGET_LOST_DISBAND_TICKS = 30;

      var POWER_PLANT_NAMES = ["GAPOWR", "NAPOWR", "NANRCT", "YAPOWR", "NATBNK"];

      function isPowerPlant(rules) {
        if (!rules) return false;
        if (rules.power > 0) return true;
        return POWER_PLANT_NAMES.indexOf(rules.name) !== -1;
      }

      function isSpyTarget(rules) {
        if (!rules || !rules.spyable) return false;
        if (isPowerPlant(rules)) return true;
        if (rules.refinery) return true;
        if (rules.weaponsFactory) return true;
        if (rules.constructionYard) return true;
        if (rules.produceCashAmount > 0) return true;
        return false;
      }

      function getTargetScore(rules) {
        if (!rules) return 0;
        if (rules.constructionYard) return 500;
        if (rules.refinery) return 400;
        if (isPowerPlant(rules)) return 350;
        if (rules.weaponsFactory) return 300;
        if (rules.produceCashAmount > 0) return 250;
        return 100;
      }

      function distanceSq(x1, y1, x2, y2) {
        var dx = x1 - x2;
        var dy = y1 - y2;
        return dx * dx + dy * dy;
      }

      var SpyMission = /** @class */ (function (Mission) {
        function SpyMission(uniqueName, priority, targetId, logger) {
          Mission.call(this, uniqueName, logger);
          this.priority = priority;
          this.targetId = targetId;
          this.hasAttemptedInfiltrateWith = null;
          this.hasMovedClose = false;
        }
        SpyMission.prototype = Object.create(Mission.prototype);
        SpyMission.prototype.constructor = SpyMission;

        SpyMission.prototype._onAiUpdate = function (gameApi, actionsApi, playerData, matchAwareness, actionBatcher) {
          var targetData = gameApi.getGameObjectData(this.targetId);
          if (!targetData || !targetData.rules || !targetData.rules.spyable) {
            if (this.hasAttemptedInfiltrateWith !== null && gameApi.getCurrentTick() > this.hasAttemptedInfiltrateWith.gameTick + TARGET_LOST_DISBAND_TICKS) {
              return disbandMission();
            }
          }

          var spyTypes = ["SPY"];
          var spies = this.getUnitsOfTypes.apply(this, [gameApi].concat(spyTypes));
          if (spies.length === 0) {
            if (this.hasAttemptedInfiltrateWith !== null) {
              return disbandMission();
            }
            return requestUnits(spyTypes, this.priority);
          }

          var spy = spies[0];
          if (this.hasAttemptedInfiltrateWith && gameApi.getCurrentTick() <= this.hasAttemptedInfiltrateWith.gameTick + INFILTRATE_COOLDOWN_TICKS) {
            return noop();
          }

          if (!targetData || !targetData.tile) return noop();

          var dx = spy.tile.rx - targetData.tile.rx;
          var dy = spy.tile.ry - targetData.tile.ry;
          var distSq = dx * dx + dy * dy;

          if (distSq > APPROACH_DISTANCE * APPROACH_DISTANCE && !this.hasMovedClose) {
            actionsApi.orderUnits([spy.id], OrderType.Move, undefined, targetData.tile.rx, targetData.tile.ry);
            this.hasMovedClose = true;
          } else {
            actionsApi.orderUnits(spies.map(function (s) { return s.id; }), OrderType.Occupy, this.targetId);
            this.hasAttemptedInfiltrateWith = { unitId: spy.id, gameTick: gameApi.getCurrentTick() };
            this.hasMovedClose = false;
          }

          return noop();
        };
        SpyMission.prototype.getGlobalDebugText = function () { return undefined; };
        SpyMission.prototype.getPriority = function () { return this.priority; };
        return SpyMission;
      }(Mission));
      e("SpyMission", SpyMission);

      var MAX_ACTIVE_SPY_MISSIONS = 2;
      var SPY_CHECK_INTERVAL_TICKS = 600;
      var SPY_MISSION_PRIORITY = 120;

      var SpyMissionFactory = /** @class */ (function () {
        function SpyMissionFactory() { this.lastCheckAt = 0; }
        SpyMissionFactory.prototype.getName = function () { return "SpyMissionFactory"; };
        SpyMissionFactory.prototype.maybeCreateMissions = function (gameApi, playerData, matchAwareness, missionController, logger) {
          if (!(gameApi.getCurrentTick() > this.lastCheckAt + SPY_CHECK_INTERVAL_TICKS)) return;
          this.lastCheckAt = gameApi.getCurrentTick();

          var activeMissions = missionController.getMissions();
          var activeSpyCount = activeMissions.filter(function (m) { return m.getUniqueName().startsWith("spy-"); }).length;
          if (activeSpyCount >= MAX_ACTIVE_SPY_MISSIONS) return;

          var enemyBuildingIds = gameApi.getVisibleUnits(playerData.name, "hostile", function (r) { return isSpyTarget(r); });

          var targets = enemyBuildingIds
            .map(function (buildingId) {
              var data = gameApi.getGameObjectData(buildingId);
              if (!data || !data.tile) return null;
              var score = getTargetScore(data.rules);
              var distance = distanceSq(playerData.startLocation.x, playerData.startLocation.y, data.tile.rx, data.tile.ry);
              return { buildingId: buildingId, score: score, distance: distance };
            })
            .filter(function (item) { return item !== null; })
            .sort(function (a, b) {
              if (b.score !== a.score) return b.score - a.score;
              return a.distance - b.distance;
            });

          var createdCount = 0;
          var remainingSlots = MAX_ACTIVE_SPY_MISSIONS - activeSpyCount;
          targets.forEach(function (target) {
            if (createdCount >= remainingSlots) return;
            var missionName = "spy-" + target.buildingId;
            var alreadyExists = activeMissions.some(function (m) { return m.getUniqueName() === missionName; });
            if (alreadyExists) return;

            missionController.addMission(new SpyMission(missionName, SPY_MISSION_PRIORITY, target.buildingId, logger));
            createdCount++;
          });
        };
        SpyMissionFactory.prototype.onMissionFailed = function () {};
        return SpyMissionFactory;
      }());
      e("SpyMissionFactory", SpyMissionFactory);
    },
  };
});
