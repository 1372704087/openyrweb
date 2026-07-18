// === Custom AI module: game/bot/custom-ai/logic/mission/missions/amphibiousScoutingMission ===
System.register("game/bot/custom-ai/logic/mission/missions/amphibiousScoutingMission", ["game/api/index", "game/bot/custom-ai/logic/mission/missionFactories", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/mission/mission", "game/bot/custom-ai/logic/mission/missionController", "game/bot/custom-ai/logic/common/utils", "game/bot/custom-ai/logic/mission/actionBatcher", "game/bot/custom-ai/logic/common/scout", "game/bot/custom-ai/logic/map/map"], function (e, t) {
  "use strict";
  var ActionsApi, GameApi, OrderType, PlayerData, Vector2, SpeedType, LandType;
  var Mission, disbandMission, noop, requestUnits;
  var determineMapBounds, getDistanceBetweenTileAndPoint;
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
        getDistanceBetweenTileAndPoint = H.getDistanceBetweenTileAndPoint;
      },
    ],
    execute: function () {

      var AMPHIBIOUS_SCOUT_MOVE_COOLDOWN_TICKS = 30;
      var MAX_ATTEMPTS_PER_TARGET = 5;
      var MAX_TICKS_PER_TARGET = 600;
      var POSITION_CHECK_INTERVAL = 60;
      var STUCK_THRESHOLD = 2;

      function getAllAmphibiousPoints(gameApi, sectorSize) {
        if (sectorSize === void 0) { sectorSize = 8; }
        var amphibiousPoints = [];
        var mapBounds = determineMapBounds(gameApi.mapApi);
        for (var x = 0; x < mapBounds.width; x += sectorSize) {
          for (var y = 0; y < mapBounds.height; y += sectorSize) {
            if (x >= 0 && x < mapBounds.width && y >= 0 && y < mapBounds.height) {
              var tile = gameApi.mapApi.getTile(x, y);
              if (tile && (tile.landType === LandType.Water || tile.landType === LandType.Clear || tile.landType === LandType.Beach || tile.landType === LandType.Tiberium)) {
                var path = gameApi.mapApi.findPath(SpeedType.Amphibious, true, { tile: tile, onBridge: false }, { tile: tile, onBridge: false });
                if (path) { amphibiousPoints.push(new Vector2(x, y)); }
              }
            }
          }
        }
        if (amphibiousPoints.length === 0 && sectorSize > 2) {
          return getAllAmphibiousPoints(gameApi, Math.floor(sectorSize / 2));
        }
        return amphibiousPoints;
      }

      var AmphibiousScoutingMission = /** @class */ (function (Mission) {
        function AmphibiousScoutingMission(uniqueName, priority, logger) {
          Mission.call(this, uniqueName, logger);
          this.priority = priority;
          this.scoutTarget = null;
          this.attemptsOnCurrentTarget = 0;
          this.scoutTargetRefreshedAt = 0;
          this.lastMoveCommandTick = 0;
          this.scoutTargetIsPermanent = false;
          this.hadUnit = false;
          this.amphibiousPoints = null;
          this.visitedPoints = new Set();
          this.lastPosition = null;
          this.lastPositionCheckTick = 0;
          this.scoutMinDistance = undefined;
        }
        AmphibiousScoutingMission.prototype = Object.create(Mission.prototype);
        AmphibiousScoutingMission.prototype.constructor = AmphibiousScoutingMission;

        AmphibiousScoutingMission.prototype.initializeAmphibiousPoints = function (gameApi) {
          if (this.amphibiousPoints === null) {
            this.amphibiousPoints = getAllAmphibiousPoints(gameApi);
            for (var i = this.amphibiousPoints.length - 1; i > 0; i--) {
              var j = Math.floor(gameApi.generateRandomInt(0, i));
              var temp = this.amphibiousPoints[i];
              this.amphibiousPoints[i] = this.amphibiousPoints[j];
              this.amphibiousPoints[j] = temp;
            }
            this.logger("找到 " + this.amphibiousPoints.length + " 个两栖探索点");
          }
        };

        AmphibiousScoutingMission.prototype.isUnitStuck = function (currentPosition) {
          if (!this.lastPosition) return false;
          var dx = Math.abs(currentPosition.x - this.lastPosition.x);
          var dy = Math.abs(currentPosition.y - this.lastPosition.y);
          return dx <= STUCK_THRESHOLD && dy <= STUCK_THRESHOLD;
        };

        AmphibiousScoutingMission.prototype.getNextAmphibiousTarget = function (gameApi, currentPosition, playerData) {
          this.initializeAmphibiousPoints(gameApi);
          if (!this.amphibiousPoints || this.amphibiousPoints.length === 0) return null;
          var bestPoint = null;
          var bestDistance = Infinity;
          for (var _i = 0, _a = this.amphibiousPoints; _i < _a.length; _i++) {
            var point = _a[_i];
            var pointKey = point.x + "," + point.y;
            if (this.visitedPoints.has(pointKey)) continue;
            var tile = gameApi.mapApi.getTile(point.x, point.y);
            if (!tile || gameApi.mapApi.isVisibleTile(tile, playerData.name)) {
              this.visitedPoints.add(pointKey);
              continue;
            }
            var distance = getDistanceBetweenTileAndPoint(tile, currentPosition);
            if (distance < bestDistance) { bestDistance = distance; bestPoint = point; }
          }
          return bestPoint;
        };

        AmphibiousScoutingMission.prototype._onAiUpdate = function (gameApi, actionsApi, playerData, matchAwareness, actionBatcher) {
          var scoutNames = ["SAPC", "LCRF"];
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

            if (gameApi.getCurrentTick() > this.lastMoveCommandTick + AMPHIBIOUS_SCOUT_MOVE_COOLDOWN_TICKS) {
              this.lastMoveCommandTick = gameApi.getCurrentTick();
              scouts.forEach(function (unit) {
                if (this.scoutTarget) { actionsApi.orderUnits([unit.id], OrderType.AttackMove, this.scoutTarget.x, this.scoutTarget.y); }
              }, this);
              var distances = scouts.map(function (unit) { return getDistanceBetweenTileAndPoint(unit.tile, this.scoutTarget); }, this);
              var newMinDistance = Math.min.apply(Math, distances);
              if (!this.scoutMinDistance || newMinDistance < this.scoutMinDistance) {
                this.logger("单位接近目标点 (" + newMinDistance + " < " + this.scoutMinDistance + ")");
                this.scoutTargetRefreshedAt = gameApi.getCurrentTick();
                this.scoutMinDistance = newMinDistance;
              }
            }

            if (gameApi.mapApi.isVisibleTile(targetTile, playerData.name)) {
              var pointKey = this.scoutTarget.x + "," + this.scoutTarget.y;
              this.visitedPoints.add(pointKey);
              this.logger("目标 " + this.scoutTarget.x + "," + this.scoutTarget.y + " 侦察成功，切换下一个目标");
              this.setScoutTarget(null, gameApi.getCurrentTick());
            }
          } else {
            var nextScoutTarget = matchAwareness.getScoutingManager().getNewScoutTarget();
            if (nextScoutTarget) {
              this.setScoutTarget(nextScoutTarget.asVector2(), gameApi.getCurrentTick());
              return noop();
            }
            var nextAmphibiousTarget = this.getNextAmphibiousTarget(gameApi, currentPosition, playerData);
            if (nextAmphibiousTarget) {
              this.setScoutTarget(nextAmphibiousTarget, gameApi.getCurrentTick());
            } else {
              this.logger("没有找到可达的两栖探索点，任务结束");
              return disbandMission();
            }
          }
          return noop();
        };

        AmphibiousScoutingMission.prototype.setScoutTarget = function (target, currentTick) {
          this.attemptsOnCurrentTarget = 0;
          this.scoutTargetRefreshedAt = currentTick;
          this.scoutTarget = target;
          this.scoutMinDistance = undefined;
          this.scoutTargetIsPermanent = false;
          this.lastPosition = null;
          this.lastPositionCheckTick = currentTick;
        };

        AmphibiousScoutingMission.prototype.getGlobalDebugText = function () { return "两栖侦察中"; };
        AmphibiousScoutingMission.prototype.getPriority = function () { return this.priority; };
        return AmphibiousScoutingMission;
      }(Mission));
      e("AmphibiousScoutingMission", AmphibiousScoutingMission);

      var AmphibiousScoutingMissionFactory = /** @class */ (function () {
        function AmphibiousScoutingMissionFactory() { this.lastScoutAt = -300; }
        AmphibiousScoutingMissionFactory.prototype.getName = function () { return "AmphibiousScoutingMissionFactory"; };
        AmphibiousScoutingMissionFactory.prototype.maybeCreateMissions = function (gameApi, playerData, matchAwareness, missionController, logger) {
          if (gameApi.getCurrentTick() < this.lastScoutAt + 300) return;
          if (!matchAwareness.getScoutingManager().hasScoutTargets()) return;
          if (!missionController.addMission(new AmphibiousScoutingMission("amphibiousScout", 10, logger))) {
            this.lastScoutAt = gameApi.getCurrentTick();
          }
        };
        AmphibiousScoutingMissionFactory.prototype.onMissionFailed = function (gameApi, playerData, matchAwareness, failedMission, failureReason, missionController, logger) {
          if (gameApi.getCurrentTick() < this.lastScoutAt + 300) return;
          if (!matchAwareness.getScoutingManager().hasScoutTargets()) return;
          if (failedMission instanceof AmphibiousScoutingMission) {
            missionController.addMission(new AmphibiousScoutingMission("amphibiousScout", 10, logger));
            this.lastScoutAt = gameApi.getCurrentTick();
          }
        };
        return AmphibiousScoutingMissionFactory;
      }());
      e("AmphibiousScoutingMissionFactory", AmphibiousScoutingMissionFactory);
    },
  };
});
