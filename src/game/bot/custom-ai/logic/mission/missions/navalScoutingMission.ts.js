// === Custom AI module: game/bot/custom-ai/logic/mission/missions/navalScoutingMission ===
System.register("game/bot/custom-ai/logic/mission/missions/navalScoutingMission", ["game/api/index", "game/bot/custom-ai/logic/mission/missionFactories", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/mission/mission", "game/bot/custom-ai/logic/mission/missionController", "game/bot/custom-ai/logic/common/utils", "game/bot/custom-ai/logic/mission/actionBatcher", "game/bot/custom-ai/logic/common/scout", "game/bot/custom-ai/logic/map/map"], function (e, t) {
  "use strict";
  var ActionsApi, GameApi, OrderType, PlayerData, Vector2, SpeedType, LandType;
  var Mission, disbandMission, noop, requestUnits;
  var determineMapBounds;
  t && t.id;
  return {
    setters: [
      function (A) {
        ActionsApi = A.ActionsApi;
        GameApi = A.GameApi;
        OrderType = A.OrderType;
        PlayerData = A.PlayerData;
        Vector2 = A.Vector2;
        SpeedType = A.SpeedType;
        LandType = A.LandType;
      },
      function () {},
      function () {},
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
        determineMapBounds = H.determineMapBounds;
      },
    ],
    execute: function () {

      var NAVAL_SCOUT_MOVE_COOLDOWN_TICKS = 30;
      var MAX_ATTEMPTS_PER_TARGET = 5;
      var MAX_TICKS_PER_TARGET = 600;
      var POSITION_CHECK_INTERVAL = 60;
      var STUCK_THRESHOLD = 2;

      function getAllWaterPoints(gameApi, sectorSize) {
        if (sectorSize === void 0) { sectorSize = 8; }
        var waterPoints = [];
        var mapBounds = determineMapBounds(gameApi.mapApi);
        for (var x = 0; x < mapBounds.width; x += sectorSize) {
          for (var y = 0; y < mapBounds.height; y += sectorSize) {
            if (x >= 0 && x < mapBounds.width && y >= 0 && y < mapBounds.height) {
              var tile = gameApi.mapApi.getTile(x, y);
              if (tile && tile.landType === LandType.Water) {
                var path = gameApi.mapApi.findPath(SpeedType.Float, true, { tile: tile, onBridge: false }, { tile: tile, onBridge: false });
                if (path) { waterPoints.push(new Vector2(x, y)); }
              }
            }
          }
        }
        if (waterPoints.length === 0 && sectorSize > 2) {
          return getAllWaterPoints(gameApi, Math.floor(sectorSize / 2));
        }
        return waterPoints;
      }

      function getFinalReachablePoint(gameApi, startPoint, targetPoint) {
        var startTile = gameApi.mapApi.getTile(startPoint.x, startPoint.y);
        var targetTile = gameApi.mapApi.getTile(targetPoint.x, targetPoint.y);
        if (!startTile || !targetTile) return null;
        var path = gameApi.mapApi.findPath(SpeedType.Float, true, { tile: startTile, onBridge: false }, { tile: targetTile, onBridge: false });
        if (!path || path.length === 0) return null;
        var lastNode = path[path.length - 1];
        return new Vector2(lastNode.tile.rx, lastNode.tile.ry);
      }

      var NavalScoutingMission = /** @class */ (function (Mission) {
        function NavalScoutingMission(uniqueName, priority, logger) {
          Mission.call(this, uniqueName, logger);
          this.priority = priority;
          this.scoutTarget = null;
          this.attemptsOnCurrentTarget = 0;
          this.scoutTargetRefreshedAt = 0;
          this.lastMoveCommandTick = 0;
          this.scoutTargetIsPermanent = false;
          this.hadUnit = false;
          this.waterPoints = null;
          this.visitedWaterPoints = new Set();
          this.lastPosition = null;
          this.lastPositionCheckTick = 0;
        }
        NavalScoutingMission.prototype = Object.create(Mission.prototype);
        NavalScoutingMission.prototype.constructor = NavalScoutingMission;

        NavalScoutingMission.prototype.initializeWaterPoints = function (gameApi) {
          if (this.waterPoints === null) {
            this.waterPoints = getAllWaterPoints(gameApi);
            for (var i = this.waterPoints.length - 1; i > 0; i--) {
              var j = Math.floor(Math.random() * (i + 1));
              var temp = this.waterPoints[i];
              this.waterPoints[i] = this.waterPoints[j];
              this.waterPoints[j] = temp;
            }
            this.logger("找到 " + this.waterPoints.length + " 个水域探索点");
          }
        };

        NavalScoutingMission.prototype.getNextWaterTarget = function (gameApi, currentPosition, matchAwareness) {
          this.initializeWaterPoints(gameApi);
          if (!this.waterPoints || this.waterPoints.length === 0) return null;
          var nearestPoint = null;
          var minDistance = Number.MAX_VALUE;
          var sectorCache = matchAwareness.getSectorCache();
          var exploredPoints = new Set();
          this.waterPoints.forEach(function (point) {
            var sector = sectorCache.getSectorForWorldPosition(point.x, point.y);
            if (sector && sector.sectorVisibilityPct !== undefined && sector.sectorVisibilityPct > 0) {
              exploredPoints.add(point.x + "," + point.y);
            }
          });
          if (this.visitedWaterPoints.size >= this.waterPoints.length) {
            this.visitedWaterPoints = exploredPoints;
          }
          for (var i = 0; i < this.waterPoints.length; i++) {
            var target = this.waterPoints[i];
            var pointKey = target.x + "," + target.y;
            if (this.visitedWaterPoints.has(pointKey)) continue;
            if (exploredPoints.has(pointKey)) { this.visitedWaterPoints.add(pointKey); continue; }
            var distance = currentPosition.distanceTo(target);
            if (distance < minDistance) {
              var finalPoint = getFinalReachablePoint(gameApi, currentPosition, target);
              if (finalPoint) { nearestPoint = target; minDistance = distance; }
            }
          }
          if (nearestPoint) {
            var pointKey = nearestPoint.x + "," + nearestPoint.y;
            this.visitedWaterPoints.add(pointKey);
            this.logger("选择新的水域探索点 " + nearestPoint.x + "," + nearestPoint.y);
          } else if (this.visitedWaterPoints.size < this.waterPoints.length) {
            this.logger("重新探索未被发现的区域");
          }
          return nearestPoint;
        };

        NavalScoutingMission.prototype.isUnitStuck = function (currentPosition) {
          if (!this.lastPosition) return false;
          var dx = Math.abs(currentPosition.x - this.lastPosition.x);
          var dy = Math.abs(currentPosition.y - this.lastPosition.y);
          return dx <= STUCK_THRESHOLD && dy <= STUCK_THRESHOLD;
        };

        NavalScoutingMission.prototype._onAiUpdate = function (gameApi, actionsApi, playerData, matchAwareness, actionBatcher) {
          var scoutNames = ["DLPH", "DEST", "SUB", "HYD", "SQD", "BSUB", "YHVR"];
          var scouts = this.getUnitsOfTypes.apply(this, [gameApi].concat(scoutNames));

          if ((matchAwareness.getSectorCache().getOverallVisibility() || 0) > 0.9) {
            return disbandMission();
          }

          if (scouts.length === 0) {
            if (this.scoutTarget && this.hadUnit) { this.attemptsOnCurrentTarget++; this.hadUnit = false; }
            return requestUnits(scoutNames, this.priority);
          }

          var currentScout = scouts[0];
          var currentPosition = new Vector2(currentScout.tile.rx, currentScout.tile.ry);

          if (gameApi.getCurrentTick() >= this.lastPositionCheckTick + POSITION_CHECK_INTERVAL) {
            if (this.lastPosition && this.isUnitStuck(currentPosition)) {
              this.logger("单位在 " + currentPosition.x + "," + currentPosition.y + " 停止移动，寻找新目标");
              this.setScoutTarget(null, gameApi.getCurrentTick());
            }
            this.lastPosition = currentPosition;
            this.lastPositionCheckTick = gameApi.getCurrentTick();
          }

          if (this.scoutTarget) {
            this.hadUnit = true;
            if (!this.scoutTargetIsPermanent) {
              if (this.attemptsOnCurrentTarget > MAX_ATTEMPTS_PER_TARGET) {
                this.logger("侦察目标 " + this.scoutTarget.x + "," + this.scoutTarget.y + " 尝试次数过多，切换下一个目标");
                this.setScoutTarget(null, 0);
                return noop();
              }
              if (gameApi.getCurrentTick() > this.scoutTargetRefreshedAt + MAX_TICKS_PER_TARGET) {
                this.logger("侦察目标 " + this.scoutTarget.x + "," + this.scoutTarget.y + " 耗时过长，切换下一个目标");
                this.setScoutTarget(null, 0);
                return noop();
              }
            }
            var targetTile = gameApi.mapApi.getTile(this.scoutTarget.x, this.scoutTarget.y);
            if (!targetTile) { throw new Error("目标位置 " + this.scoutTarget.x + "," + this.scoutTarget.y + " 不存在"); }
            if (gameApi.getCurrentTick() > this.lastMoveCommandTick + NAVAL_SCOUT_MOVE_COOLDOWN_TICKS) {
              this.lastMoveCommandTick = gameApi.getCurrentTick();
              scouts.forEach(function (unit) {
                if (this.scoutTarget) { actionsApi.orderUnits([unit.id], OrderType.Move, this.scoutTarget.x, this.scoutTarget.y); }
              }, this);
            }
            if (gameApi.mapApi.isVisibleTile(targetTile, playerData.name)) {
              var pointKey = this.scoutTarget.x + "," + this.scoutTarget.y;
              this.visitedWaterPoints.add(pointKey);
              this.logger("目标 " + this.scoutTarget.x + "," + this.scoutTarget.y + " 侦察成功，切换下一个目标");
              this.setScoutTarget(null, gameApi.getCurrentTick());
            }
          } else {
            var nextScoutTarget = matchAwareness.getScoutingManager().getNewScoutTarget();
            if (nextScoutTarget) {
              var targetPoint = nextScoutTarget.asVector2();
              if (targetPoint) {
                var finalPoint = getFinalReachablePoint(gameApi, currentPosition, targetPoint);
                if (finalPoint) {
                  this.setScoutTarget(finalPoint, gameApi.getCurrentTick());
                  this.logger("前往侦察目标 " + finalPoint.x + "," + finalPoint.y);
                  return noop();
                }
              }
            }
            var nextWaterTarget = this.getNextWaterTarget(gameApi, currentPosition, matchAwareness);
            if (nextWaterTarget) {
              this.setScoutTarget(nextWaterTarget, gameApi.getCurrentTick());
            } else {
              this.logger("没有找到可达的水域探索点，任务结束");
              return disbandMission();
            }
          }
          return noop();
        };

        NavalScoutingMission.prototype.setScoutTarget = function (target, currentTick) {
          this.attemptsOnCurrentTarget = 0;
          this.scoutTargetRefreshedAt = currentTick;
          this.scoutTarget = target;
          this.scoutTargetIsPermanent = false;
          this.lastPosition = null;
          this.lastPositionCheckTick = currentTick;
        };

        NavalScoutingMission.prototype.getGlobalDebugText = function () { return "海军侦察中"; };
        NavalScoutingMission.prototype.getPriority = function () { return this.priority; };
        return NavalScoutingMission;
      }(Mission));
      e("NavalScoutingMission", NavalScoutingMission);

      var NavalScoutingMissionFactory = /** @class */ (function () {
        function NavalScoutingMissionFactory() { this.lastScoutAt = -300; }
        NavalScoutingMissionFactory.prototype.getName = function () { return "NavalScoutingMissionFactory"; };
        NavalScoutingMissionFactory.prototype.maybeCreateMissions = function (gameApi, playerData, matchAwareness, missionController, logger) {
          if (gameApi.getCurrentTick() < this.lastScoutAt + 300) return;
          if (!matchAwareness.getScoutingManager().hasScoutTargets()) return;
          if (!missionController.addMission(new NavalScoutingMission("navalScout", 10, logger))) {
            this.lastScoutAt = gameApi.getCurrentTick();
          }
        };
        NavalScoutingMissionFactory.prototype.onMissionFailed = function (gameApi, playerData, matchAwareness, failedMission, failureReason, missionController, logger) {
          if (gameApi.getCurrentTick() < this.lastScoutAt + 300) return;
          if (!matchAwareness.getScoutingManager().hasScoutTargets()) return;
          if (failedMission instanceof NavalScoutingMission) {
            missionController.addMission(new NavalScoutingMission("navalScout", 10, logger));
            this.lastScoutAt = gameApi.getCurrentTick();
          }
        };
        return NavalScoutingMissionFactory;
      }());
      e("NavalScoutingMissionFactory", NavalScoutingMissionFactory);
    },
  };
});
