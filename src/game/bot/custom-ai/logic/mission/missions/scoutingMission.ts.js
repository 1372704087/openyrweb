// === Custom AI module: game/bot/custom-ai/logic/mission/missions/scoutingMission ===
System.register("game/bot/custom-ai/logic/mission/missions/scoutingMission", ["game/api/index", "game/bot/custom-ai/logic/mission/missionFactories", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/mission/mission", "game/bot/custom-ai/logic/mission/missions/attackMission", "game/bot/custom-ai/logic/mission/missionController", "game/bot/custom-ai/logic/common/utils", "game/bot/custom-ai/logic/mission/actionBatcher", "game/bot/custom-ai/logic/map/map", "game/bot/custom-ai/logic/common/scout"], function (e, t) {
  "use strict";
  var ActionsApi, GameApi, OrderType, PlayerData, SideType, Vector2;
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
        SideType = A.SideType;
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
      // 侦察任务最高优先级 — 开局必须最先出侦察单位
      var SCOUT_MISSION_PRIORITY = 200;

      // 按阵营返回侦察单位列表：尤里用狂兽人，苏联/盟军用狗
      var getScoutNamesForSide = function (side) {
        if (side === SideType.ThirdSide) {
          // 尤里：狂兽人(BRUTE)主探，基本兵(INIT)备选
          return ["BRUTE", "INIT"];
        }
        if (side === SideType.Nod) {
          // 苏联：攻击犬(DOG)主探，防空车(HTK)备选
          return ["DOG", "HTK"];
        }
        // 盟军：攻击犬(ADOG)主探，多功能车(FV)备选
        return ["ADOG", "FV"];
      };

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
          this.scoutNames = ["ADOG", "DOG", "E1", "E2", "FV", "HTK", "BRUTE", "INIT"];
        }
        ScoutingMission.prototype = Object.create(Mission.prototype);
        ScoutingMission.prototype.constructor = ScoutingMission;

        ScoutingMission.prototype.setScoutNames = function (names) {
          this.scoutNames = names;
        };

        ScoutingMission.prototype._onAiUpdate = function (gameApi, actionsApi, playerData, matchAwareness, actionBatcher) {
          var scoutNames = this.scoutNames;
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

      var SCOUT_COOLDOWN_TICKS = 60;
      // 同时允许的最大侦察任务数（多路同时探路）
      var MAX_CONCURRENT_SCOUTS = 3;
      // 开局前 N tick 内侦察优先级额外提升
      var EARLY_GAME_TICKS = 600;

      var ScoutingMissionFactory = /** @class */ (function () {
        function ScoutingMissionFactory() { this.lastScoutAt = -SCOUT_COOLDOWN_TICKS; }
        ScoutingMissionFactory.prototype.getName = function () { return "ScoutingMissionFactory"; };
        ScoutingMissionFactory.prototype.maybeCreateMissions = function (gameApi, playerData, matchAwareness, missionController, logger) {
          if (gameApi.getCurrentTick() < this.lastScoutAt + SCOUT_COOLDOWN_TICKS) return;
          if (!matchAwareness.getScoutingManager().hasScoutTargets()) return;

          // 按阵营确定侦察单位
          var side = playerData.country ? playerData.country.side : SideType.GDI;
          var scoutNames = getScoutNamesForSide(side);

          // 统计当前活跃侦察任务数
          var activeScouts = missionController.getMissions().filter(function (m) {
            return m.getUniqueName().indexOf("scout-") === 0;
          });
          if (activeScouts.length >= MAX_CONCURRENT_SCOUTS) return;

          // 开局阶段优先级更高
          var priority = SCOUT_MISSION_PRIORITY;
          if (gameApi.getCurrentTick() < EARLY_GAME_TICKS) {
            priority = SCOUT_MISSION_PRIORITY + 50;
          }

          var scoutName = "scout-" + activeScouts.length + "-" + gameApi.getCurrentTick();
          var mission = new ScoutingMission(scoutName, priority, logger);
          mission.setScoutNames(scoutNames);
          if (missionController.addMission(mission)) {
            logger("[SCOUT] 启动侦察任务 " + scoutName + " 优先级=" + priority + " 侦察单位=" + JSON.stringify(scoutNames) + " [" + (activeScouts.length + 1) + "/" + MAX_CONCURRENT_SCOUTS + "]");
            this.lastScoutAt = gameApi.getCurrentTick();
          }
        };
        ScoutingMissionFactory.prototype.onMissionFailed = function (gameApi, playerData, matchAwareness, failedMission, failureReason, missionController, logger) {
          if (gameApi.getCurrentTick() < this.lastScoutAt + SCOUT_COOLDOWN_TICKS) return;
          if (!matchAwareness.getScoutingManager().hasScoutTargets()) return;

          var side = playerData.country ? playerData.country.side : SideType.GDI;
          var scoutNames = getScoutNamesForSide(side);

          var activeScouts = missionController.getMissions().filter(function (m) {
            return m.getUniqueName().indexOf("scout-") === 0;
          });
          if (activeScouts.length >= MAX_CONCURRENT_SCOUTS) return;

          // 攻击失败后重新侦察
          if (failedMission instanceof AttackMission) {
            var scoutName = "scout-recon-" + gameApi.getCurrentTick();
            var mission = new ScoutingMission(scoutName, SCOUT_MISSION_PRIORITY, logger);
            mission.setScoutNames(scoutNames);
            missionController.addMission(mission);
            this.lastScoutAt = gameApi.getCurrentTick();
          }
        };
        return ScoutingMissionFactory;
      }());
      e("ScoutingMissionFactory", ScoutingMissionFactory);
    },
  };
});
