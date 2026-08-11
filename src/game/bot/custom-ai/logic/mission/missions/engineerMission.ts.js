// === Custom AI module: game/bot/custom-ai/logic/mission/missions/engineerMission ===
System.register("game/bot/custom-ai/logic/mission/missions/engineerMission", ["game/api/index", "game/bot/custom-ai/logic/mission/mission", "game/bot/custom-ai/logic/mission/missionFactories", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/mission/missionController", "game/bot/custom-ai/logic/common/utils", "game/bot/custom-ai/logic/mission/actionBatcher"], function (e, t) {
  "use strict";
  var ActionsApi, GameApi, ObjectType, OrderType, PlayerData, Vector2;
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
      var THREAT_CHECK_INTERVAL_TICKS = 60;
      var THREAT_SCAN_RADIUS = 5;
      // 触发绕路的威胁阈值：1个防御建筑或3个战斗单位就开始绕
      var MAX_ENGINEER_THREAT_SCORE = 3;
      // 目标选择时允许的最大威胁分（比绕路阈值宽松，因为可以绕路）
      var MAX_TARGET_THREAT_SCORE = 8;
      // 绕路偏移距离（格）
      var FLANKING_OFFSET_DISTANCE = 8;
      // 到达绕路点的判定距离平方
      var FLANKING_ARRIVAL_DISTANCE_SQ = 6;
      // 最大绕路尝试次数，超过则放弃
      var MAX_FLANKING_ATTEMPTS = 3;

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

      // 评估目标建筑附近的威胁：防御建筑(权重×3) + 移动战斗单位(权重×1)
      function assessEngineerTargetThreat(gameApi, matchAwareness, targetTile) {
        try {
          var targetPoint = new Vector2(targetTile.rx, targetTile.ry);
          var nearbyHostiles = matchAwareness.getHostilesNearPoint2d(targetPoint, THREAT_SCAN_RADIUS);
          var defensiveBuildings = 0;
          var mobileThreats = 0;
          for (var i = 0; i < nearbyHostiles.length; i++) {
            var unit = gameApi.getUnitData(nearbyHostiles[i].unitId);
            if (!unit || !unit.rules) continue;
            if (unit.type === ObjectType.Building) {
              if (unit.rules.primary || unit.rules.secondary) {
                defensiveBuildings++;
              }
            } else if (unit.rules.isSelectableCombatant) {
              mobileThreats++;
            }
          }
          return defensiveBuildings * 3 + mobileThreats;
        } catch (err) {
          return 0;
        }
      }

      // 计算绕路点：从目标出发，向威胁集群的反方向偏移，让工程师从侧面接近
      function calculateFlankingWaypoint(gameApi, matchAwareness, targetTile) {
        try {
          var targetPoint = new Vector2(targetTile.rx, targetTile.ry);
          var nearbyHostiles = matchAwareness.getHostilesNearPoint2d(targetPoint, THREAT_SCAN_RADIUS * 2);
          if (nearbyHostiles.length === 0) return null;

          // 计算威胁质心
          var cx = 0, cy = 0, count = 0;
          for (var i = 0; i < nearbyHostiles.length; i++) {
            var u = gameApi.getUnitData(nearbyHostiles[i].unitId);
            if (u && u.tile) {
              cx += u.tile.rx;
              cy += u.tile.ry;
              count++;
            }
          }
          if (count === 0) return null;
          cx /= count;
          cy /= count;

          // 从威胁质心指向目标的方向，反方向就是绕路方向
          var dx = targetTile.rx - cx;
          var dy = targetTile.ry - cy;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 0.5) {
            // 威胁在目标正中心，选一个默认方向
            dx = FLANKING_OFFSET_DISTANCE;
            dy = 0;
          } else {
            dx = (dx / dist) * FLANKING_OFFSET_DISTANCE;
            dy = (dy / dist) * FLANKING_OFFSET_DISTANCE;
          }

          return {
            x: Math.round(targetTile.rx + dx),
            y: Math.round(targetTile.ry + dy)
          };
        } catch (err) {
          return null;
        }
      }

      var EngineerMission = /** @class */ (function (Mission) {
        function EngineerMission(uniqueName, priority, captureTargetId, targetTile, logger) {
          Mission.call(this, uniqueName, logger);
          this.priority = priority;
          this.captureTargetId = captureTargetId;
          this.targetTile = targetTile;
          this.hasAttemptedCaptureWith = null;
          this.lastThreatCheckAt = 0;
          this.isFlanking = false;
          this.flankingWaypoint = null;
          this.flankingAttempts = 0;
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
          }

          var engineer = engineers[0];

          // 定期检查目标附近的威胁
          if (gameApi.getCurrentTick() > this.lastThreatCheckAt + THREAT_CHECK_INTERVAL_TICKS) {
            this.lastThreatCheckAt = gameApi.getCurrentTick();
            var threatScore = assessEngineerTargetThreat(gameApi, matchAwareness, this.targetTile);

            if (threatScore > MAX_ENGINEER_THREAT_SCORE) {
              if (this.flankingAttempts >= MAX_FLANKING_ATTEMPTS) {
                this.logger("[ENGINEER] 已绕路" + MAX_FLANKING_ATTEMPTS + "次仍无法接近目标 " + this.captureTargetId + "，放弃");
                return disbandMission();
              }
              var wp = calculateFlankingWaypoint(gameApi, matchAwareness, this.targetTile);
              if (wp) {
                this.isFlanking = true;
                this.flankingWaypoint = wp;
                this.flankingAttempts++;
                this.logger("[ENGINEER] 目标 " + this.captureTargetId + " 有威胁(score=" + threatScore + ")，绕路(" + this.flankingAttempts + "/" + MAX_FLANKING_ATTEMPTS + ")到(" + wp.x + "," + wp.y + ")");
              } else {
                this.logger("[ENGINEER] 无法计算绕路点，直接尝试占领");
                this.isFlanking = false;
                this.flankingWaypoint = null;
              }
            } else {
              // 威胁消失，取消绕路
              if (this.isFlanking) {
                this.logger("[ENGINEER] 威胁解除，恢复直接占领");
              }
              this.isFlanking = false;
              this.flankingWaypoint = null;
            }
          }

          // 绕路模式：先移动到绕路点
          if (this.isFlanking && this.flankingWaypoint) {
            var engTile = engineer.tile;
            if (engTile) {
              var distToWp = distanceSq(engTile.rx, engTile.ry, this.flankingWaypoint.x, this.flankingWaypoint.y);
              if (distToWp < FLANKING_ARRIVAL_DISTANCE_SQ) {
                this.logger("[ENGINEER] 已到达绕路点(" + this.flankingWaypoint.x + "," + this.flankingWaypoint.y + ")，准备占领");
                this.isFlanking = false;
                this.flankingWaypoint = null;
              }
            }
            if (this.isFlanking && this.flankingWaypoint) {
              actionsApi.orderUnits([engineer.id], OrderType.Move, this.flankingWaypoint.x, this.flankingWaypoint.y);
              return noop();
            }
          }

          // 正常占领逻辑
          if (!this.hasAttemptedCaptureWith || gameApi.getCurrentTick() > this.hasAttemptedCaptureWith.gameTick + CAPTURE_COOLDOWN_TICKS) {
            actionsApi.orderUnits(engineers.map(function (e) { return e.id; }), OrderType.Capture, this.captureTargetId);
            this.hasAttemptedCaptureWith = { unitId: engineer.id, gameTick: gameApi.getCurrentTick() };
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
      // 战车工厂出来后，工程师比重大幅降低
      var POST_WARFACTORY_PRIORITY = 30;
      var POST_WARFACTORY_MAX_TARGETS = 1;
      var POST_WARFACTORY_CHECK_INTERVAL_TICKS = 900;
      var WARFACTORY_NAMES = ["GAWEAP", "NAWEAP", "YAWEAP"];

      function hasWarFactory(gameApi, playerData) {
        return WARFACTORY_NAMES.some(function (name) {
          return gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.name === name; }).length > 0;
        });
      }

      var EngineerMissionFactory = /** @class */ (function () {
        function EngineerMissionFactory() { this.lastCheckAt = 0; }
        EngineerMissionFactory.prototype.getName = function () { return "EngineerMissionFactory"; };
        EngineerMissionFactory.prototype.maybeCreateMissions = function (gameApi, playerData, matchAwareness, missionController, logger) {
          var self = this;
          var currentTick = gameApi.getCurrentTick();
          var tickRate = gameApi.getTickRate() || 15;
          var elapsedSeconds = currentTick / tickRate;
          var isRushMode = elapsedSeconds < RUSH_MODE_SECONDS;

          // 战车工厂出来后，工程师偷家频率大幅降低
          var warFactoryExists = hasWarFactory(gameApi, playerData);
          var checkInterval = warFactoryExists ? POST_WARFACTORY_CHECK_INTERVAL_TICKS : TECH_CHECK_INTERVAL_TICKS;
          var maxTargets = warFactoryExists ? POST_WARFACTORY_MAX_TARGETS : MAX_CAPTURE_TARGETS_PER_CHECK;

          if (!(gameApi.getCurrentTick() > this.lastCheckAt + checkInterval)) return;
          this.lastCheckAt = gameApi.getCurrentTick();

          if (warFactoryExists) {
            logger("[ENGINEER] 战车工厂已存在，工程师偷家频率大幅降低 (间隔=" + checkInterval + "t, 上限=" + maxTargets + ")");
          }

          var enemyBuildingIds = gameApi.getVisibleUnits(playerData.name, "hostile", function (r) {
            if (!r.capturable) return false;
            // 战车工厂出来后，只偷建造场和精炼厂，不再偷电厂/战车工厂
            if (warFactoryExists) {
              return r.constructionYard || r.refinery;
            }
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
              // 威胁评估：跳过防御过于严密的目标
              var threatScore = assessEngineerTargetThreat(gameApi, matchAwareness, data.tile);
              return { buildingId: buildingId, score: score, distance: distance, isRushTarget: isRushTarget, tile: data.tile, threatScore: threatScore };
            })
            .filter(function (item) { return item !== null; })
            .filter(function (item) {
              if (item.threatScore > MAX_TARGET_THREAT_SCORE) {
                logger("[ENGINEER] 跳过目标 " + item.buildingId + "，防御过于严密(score=" + item.threatScore + " > " + MAX_TARGET_THREAT_SCORE + ")");
                return false;
              }
              return true;
            })
            .sort(function (a, b) {
              if (b.score !== a.score) return b.score - a.score;
              return a.distance - b.distance;
            });

          var activeMissions = missionController.getMissions();
          var createdCount = 0;
          targets.forEach(function (target) {
            if (createdCount >= maxTargets) return;
            var missionName = "capture-" + target.buildingId;
            var alreadyExists = activeMissions.some(function (m) { return m.getUniqueName() === missionName; });
            if (alreadyExists) return;

            var priority = warFactoryExists ? POST_WARFACTORY_PRIORITY : NORMAL_PRIORITY;
            if (isRushMode && target.isRushTarget) {
              priority = warFactoryExists ? POST_WARFACTORY_PRIORITY : RUSH_PRIORITY;
            }

            missionController.addMission(new EngineerMission(missionName, priority, target.buildingId, target.tile, logger));
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
