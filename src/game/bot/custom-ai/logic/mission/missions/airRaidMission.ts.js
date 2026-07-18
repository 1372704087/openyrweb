// === Custom AI module: game/bot/custom-ai/logic/mission/missions/airRaidMission ===
System.register("game/bot/custom-ai/logic/mission/missions/airRaidMission", ["game/api/index", "game/bot/custom-ai/logic/mission/mission", "game/bot/custom-ai/logic/mission/missionFactories", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/mission/missionController", "game/bot/custom-ai/logic/common/utils", "game/bot/custom-ai/logic/mission/actionBatcher"], function (e, t) {
  "use strict";
  var ActionsApi, GameApi, ObjectType, OrderType, PlayerData, SideType, Vector2;
  var Mission, disbandMission, noop, requestUnits;
  t && t.id;
  return {
    setters: [
      function (A) {
        ActionsApi = A.ActionsApi;
        GameApi = A.GameApi;
        ObjectType = A.ObjectType;
        OrderType = A.OrderType;
        PlayerData = A.PlayerData;
        SideType = A.SideType;
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

      var AIR_RAID_MIN_AIRCRAFT = 4;
      var AIR_RAID_ATTACK_COOLDOWN_TICKS = 60;
      var AIR_RAID_RETARGET_TICKS = 300;
      var AIR_RAID_DISBAND_IDLE_TICKS = 600;

      var POWER_PLANT_NAMES = ["GAPOWR", "NAPOWR", "NANRCT", "YAPOWR", "NATBNK"];

      function isPowerPlant(rules) {
        if (!rules) return false;
        if (rules.power > 0) return true;
        return POWER_PLANT_NAMES.indexOf(rules.name) !== -1;
      }

      function isAirRaidTarget(rules) {
        if (!rules) return false;
        if (rules.harvester) return true;
        if (isPowerPlant(rules)) return true;
        if (rules.refinery) return true;
        if (rules.weaponsFactory) return true;
        return false;
      }

      function getAirRaidTargetScore(rules) {
        if (!rules) return 0;
        if (rules.harvester) return 500;
        if (isPowerPlant(rules)) return 400;
        if (rules.refinery) return 350;
        if (rules.weaponsFactory) return 300;
        return 100;
      }

      function distanceSq(x1, y1, x2, y2) {
        var dx = x1 - x2;
        var dy = y1 - y2;
        return dx * dx + dy * dy;
      }

      function getAirUnitTypesForSide(side) {
        if (side === SideType.Nod) return ["ZEP"];
        if (side === SideType.GDI) return ["JUMPJET", "ORCA"];
        return [];
      }

      function hasAirProduction(gameApi, playerData) {
        if (playerData.country.side === SideType.GDI) {
          return gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.name === "GAAIRC" || r.name === "AMRADR"; }).length > 0;
        }
        if (playerData.country.side === SideType.Nod) {
          return gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.name === "NARADR"; }).length > 0;
        }
        return false;
      }

      var AirRaidState = { Preparing: 0, Attacking: 1 };

      var AirRaidMission = /** @class */ (function (Mission) {
        function AirRaidMission(uniqueName, priority, logger) {
          Mission.call(this, uniqueName, logger);
          this.priority = priority;
          this.state = AirRaidState.Preparing;
          this.lastAttackAt = 0;
          this.lastTargetSeenAt = 0;
          this.currentTargetId = null;
        }
        AirRaidMission.prototype = Object.create(Mission.prototype);
        AirRaidMission.prototype.constructor = AirRaidMission;

        AirRaidMission.prototype._onAiUpdate = function (gameApi, actionsApi, playerData, matchAwareness, actionBatcher) {
          if (!playerData.country) return disbandMission();

          var airUnitTypes = getAirUnitTypesForSide(playerData.country.side);
          if (airUnitTypes.length === 0) return disbandMission();

          var aircraft = this.getUnitsOfTypes.apply(this, [gameApi].concat(airUnitTypes));

          if (this.state === AirRaidState.Preparing) {
            if (aircraft.length < AIR_RAID_MIN_AIRCRAFT) {
              return requestUnits(airUnitTypes, this.priority);
            }
            this.state = AirRaidState.Attacking;
            this.lastTargetSeenAt = gameApi.getCurrentTick();
          }

          if (aircraft.length === 0) {
            return disbandMission();
          }

          var currentTick = gameApi.getCurrentTick();
          if (currentTick < this.lastAttackAt + AIR_RAID_ATTACK_COOLDOWN_TICKS) {
            return noop();
          }

          var targetId = this.pickTarget(gameApi, playerData, matchAwareness);
          if (targetId !== null && targetId !== this.currentTargetId) {
            this.currentTargetId = targetId;
            this.lastTargetSeenAt = currentTick;
          }

          if (this.currentTargetId === null) {
            if (currentTick > this.lastTargetSeenAt + AIR_RAID_DISBAND_IDLE_TICKS) {
              return disbandMission();
            }
            if (currentTick > this.lastTargetSeenAt + AIR_RAID_RETARGET_TICKS) {
              this.currentTargetId = this.pickFallbackTarget(gameApi, playerData, matchAwareness);
              if (this.currentTargetId !== null) {
                this.lastTargetSeenAt = currentTick;
              }
            }
          }

          if (this.currentTargetId !== null) {
            var targetData = gameApi.getGameObjectData(this.currentTargetId);
            if (!targetData || !targetData.tile) {
              this.currentTargetId = null;
              return noop();
            }
            actionsApi.orderUnits(aircraft.map(function (a) { return a.id; }), OrderType.Attack, this.currentTargetId);
            this.lastAttackAt = currentTick;
            this.lastTargetSeenAt = currentTick;
          }

          return noop();
        };

        AirRaidMission.prototype.pickTarget = function (gameApi, playerData, matchAwareness) {
          var rallyPoint = matchAwareness.getMainRallyPoint();
          var enemyUnits = gameApi.getVisibleUnits(playerData.name, "enemy")
            .map(function (unitId) { return gameApi.getGameObjectData(unitId); })
            .filter(function (u) { return !!u && !!u.rules && isAirRaidTarget(u.rules); });

          if (enemyUnits.length === 0) return null;

          var scored = enemyUnits.map(function (u) {
            var score = getAirRaidTargetScore(u.rules);
            var dist = distanceSq(rallyPoint.x, rallyPoint.y, u.tile.rx, u.tile.ry);
            return { unit: u, score: score, dist: dist };
          }).sort(function (a, b) {
            if (b.score !== a.score) return b.score - a.score;
            return a.dist - b.dist;
          });

          return scored[0].unit.id;
        };

        AirRaidMission.prototype.pickFallbackTarget = function (gameApi, playerData, matchAwareness) {
          var enemyBuildings = gameApi.getVisibleUnits(playerData.name, "enemy", function (r) { return r.type === ObjectType.Building; })
            .map(function (unitId) { return gameApi.getGameObjectData(unitId); })
            .filter(function (u) { return !!u && !!u.tile; });
          if (enemyBuildings.length === 0) return null;
          var idx = gameApi.generateRandomInt(0, enemyBuildings.length - 1);
          return enemyBuildings[idx].id;
        };

        AirRaidMission.prototype.getGlobalDebugText = function () { return "AirRaid target=" + this.currentTargetId; };
        AirRaidMission.prototype.getPriority = function () { return this.priority; };
        return AirRaidMission;
      }(Mission));
      e("AirRaidMission", AirRaidMission);

      var AIR_RAID_CHECK_INTERVAL_TICKS = 900;
      var AIR_RAID_PRIORITY = 80;

      var AirRaidMissionFactory = /** @class */ (function () {
        function AirRaidMissionFactory() { this.lastCheckAt = 0; }
        AirRaidMissionFactory.prototype.getName = function () { return "AirRaidMissionFactory"; };
        AirRaidMissionFactory.prototype.maybeCreateMissions = function (gameApi, playerData, matchAwareness, missionController, logger) {
          if (!playerData.country) return;
          if (!hasAirProduction(gameApi, playerData)) return;
          if (!(gameApi.getCurrentTick() > this.lastCheckAt + AIR_RAID_CHECK_INTERVAL_TICKS)) return;
          this.lastCheckAt = gameApi.getCurrentTick();

          var activeMissions = missionController.getMissions();
          var hasActiveAirRaid = activeMissions.some(function (m) { return m.getUniqueName().startsWith("airraid-"); });
          if (hasActiveAirRaid) return;

          var missionName = "airraid-" + gameApi.getCurrentTick();
          missionController.addMission(new AirRaidMission(missionName, AIR_RAID_PRIORITY, logger));
        };
        AirRaidMissionFactory.prototype.onMissionFailed = function () {};
        return AirRaidMissionFactory;
      }());
      e("AirRaidMissionFactory", AirRaidMissionFactory);
    },
  };
});
