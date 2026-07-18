// === Custom AI module: game/bot/custom-ai/logic/mission/missions/scoutingMission ===
System.register("game/bot/custom-ai/logic/mission/missions/scoutingMission", ["game/api/index", "game/bot/custom-ai/logic/mission/missionFactories", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/mission/mission", "game/bot/custom-ai/logic/mission/missions/attackMission", "game/bot/custom-ai/logic/mission/missionController", "game/bot/custom-ai/logic/common/utils", "game/bot/custom-ai/logic/mission/actionBatcher", "game/bot/custom-ai/logic/map/map", "game/bot/custom-ai/logic/common/scout"], function (e, t) {
  "use strict";
  var ActionsApi, GameApi, OrderType, PlayerData, Vector2;
  var AttackMission;
  var Mission, disbandMission, noop, requestUnits;
  var getDistanceBetweenTileAndPoint;
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
      function () {},
      function (C) {
        AttackMission = C.AttackMission;
      },
      function (D) {
        Mission = D.Mission;
        disbandMission = D.disbandMission;
        noop = D.noop;
        requestUnits = D.requestUnits;
      },
      function () {},
      function () {},
      function () {},
      function () {},
      function (H) {
        getDistanceBetweenTileAndPoint = H.getDistanceBetweenTileAndPoint;
      },
      function () {},
    ],
    execute: function () {

      var SCOUT_MOVE_COOLDOWN_TICKS = 30;
      var MAX_ATTEMPTS_PER_TARGET = 5;
      var MAX_TICKS_PER_TARGET = 600;

      var ScoutingMission = /** @class */ (function (Mission) {
        function ScoutingMission(uniqueName, priority, logger) {
          Mission.call(this, uniqueName, logger);
          this.priority = priority;
          this.scoutTarget = null;
          this.attemptsOnCurrentTarget = 0;
          this.scoutTargetRefreshedAt = 0;
          this.lastMoveCommandTick = 0;
          this.scoutTargetIsPermanent = false;
          this.scoutMinDistance = undefined;
          this.hadUnit = false;
        }
        ScoutingMission.prototype = Object.create(Mission.prototype);
        ScoutingMission.prototype.constructor = ScoutingMission;

        ScoutingMission.prototype._onAiUpdate = function (gameApi, actionsApi, playerData, matchAwareness, actionBatcher) {
          var scoutNames = ["ADOG", "DOG", "E1", "E2", "FV", "HTK"];
          var scouts = this.getUnitsOfTypes.apply(this, [gameApi].concat(scoutNames));

          if ((matchAwareness.getSectorCache().getOverallVisibility() || 0) > 0.9) {
            return disbandMission();
          }

          if (scouts.length === 0) {
            if (this.scoutTarget && this.hadUnit) {
              this.attemptsOnCurrentTarget++;
              this.hadUnit = false;
            }
            return requestUnits(scoutNames, this.priority);
          } else if (this.scoutTarget) {
            this.hadUnit = true;
            if (!this.scoutTargetIsPermanent) {
              if (this.attemptsOnCurrentTarget > MAX_ATTEMPTS_PER_TARGET) {
                this.logger("Scout target " + this.scoutTarget.x + "," + this.scoutTarget.y + " took too many attempts, moving to next");
                this.setScoutTarget(null, 0);
                return noop();
              }
              if (gameApi.getCurrentTick() > this.scoutTargetRefreshedAt + MAX_TICKS_PER_TARGET) {
                this.logger("Scout target " + this.scoutTarget.x + "," + this.scoutTarget.y + " took too long, moving to next");
                this.setScoutTarget(null, 0);
                return noop();
              }
            }
            var targetTile = gameApi.mapApi.getTile(this.scoutTarget.x, this.scoutTarget.y);
            if (!targetTile) {
              throw new Error("target tile " + this.scoutTarget.x + "," + this.scoutTarget.y + " does not exist");
            }
            if (gameApi.getCurrentTick() > this.lastMoveCommandTick + SCOUT_MOVE_COOLDOWN_TICKS) {
              this.lastMoveCommandTick = gameApi.getCurrentTick();
              scouts.forEach(function (unit) {
                if (this.scoutTarget) {
                  actionsApi.orderUnits([unit.id], OrderType.AttackMove, this.scoutTarget.x, this.scoutTarget.y);
                }
              }, this);
              var distances = scouts.map(function (unit) { return getDistanceBetweenTileAndPoint(unit.tile, this.scoutTarget); }, this);
              var newMinDistance = Math.min.apply(Math, distances);
              if (!this.scoutMinDistance || newMinDistance < this.scoutMinDistance) {
                this.logger("Scout timeout refreshed because unit moved closer to point (" + newMinDistance + " < " + this.scoutMinDistance + ")");
                this.scoutTargetRefreshedAt = gameApi.getCurrentTick();
                this.scoutMinDistance = newMinDistance;
              }
            }
            if (gameApi.mapApi.isVisibleTile(targetTile, playerData.name)) {
              this.logger("Scout target " + this.scoutTarget.x + "," + this.scoutTarget.y + " successfully scouted, moving to next");
              this.setScoutTarget(null, gameApi.getCurrentTick());
            }
          } else {
            var nextScoutTarget = matchAwareness.getScoutingManager().getNewScoutTarget();
            if (!nextScoutTarget) {
              this.logger("No more scouting targets available, disbanding.");
              return disbandMission();
            }
            this.setScoutTarget(nextScoutTarget, gameApi.getCurrentTick());
          }
          return noop();
        };

        ScoutingMission.prototype.setScoutTarget = function (target, currentTick) {
          this.attemptsOnCurrentTarget = 0;
          this.scoutTargetRefreshedAt = currentTick;
          this.scoutTarget = target ? target.asVector2() : null;
          this.scoutMinDistance = undefined;
          this.scoutTargetIsPermanent = target ? target.isPermanent : false;
        };

        ScoutingMission.prototype.getGlobalDebugText = function () { return "scouting"; };
        ScoutingMission.prototype.getPriority = function () { return this.priority; };
        return ScoutingMission;
      }(Mission));
      e("ScoutingMission", ScoutingMission);

      var SCOUT_COOLDOWN_TICKS = 300;

      var ScoutingMissionFactory = /** @class */ (function () {
        function ScoutingMissionFactory() { this.lastScoutAt = -SCOUT_COOLDOWN_TICKS; }
        ScoutingMissionFactory.prototype.getName = function () { return "ScoutingMissionFactory"; };
        ScoutingMissionFactory.prototype.maybeCreateMissions = function (gameApi, playerData, matchAwareness, missionController, logger) {
          if (gameApi.getCurrentTick() < this.lastScoutAt + SCOUT_COOLDOWN_TICKS) return;
          if (!matchAwareness.getScoutingManager().hasScoutTargets()) return;
          if (!missionController.addMission(new ScoutingMission("globalScout", 10, logger))) {
            this.lastScoutAt = gameApi.getCurrentTick();
          }
        };
        ScoutingMissionFactory.prototype.onMissionFailed = function (gameApi, playerData, matchAwareness, failedMission, failureReason, missionController, logger) {
          if (gameApi.getCurrentTick() < this.lastScoutAt + SCOUT_COOLDOWN_TICKS) return;
          if (!matchAwareness.getScoutingManager().hasScoutTargets()) return;
          if (failedMission instanceof AttackMission) {
            missionController.addMission(new ScoutingMission("globalScout", 10, logger));
            this.lastScoutAt = gameApi.getCurrentTick();
          }
        };
        return ScoutingMissionFactory;
      }());
      e("ScoutingMissionFactory", ScoutingMissionFactory);
    },
  };
});
