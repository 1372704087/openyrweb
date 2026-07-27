// === Custom AI module: game/bot/custom-ai/logic/mission/missions/expansionMission ===
System.register("game/bot/custom-ai/logic/mission/missions/expansionMission", ["game/api/index", "game/bot/custom-ai/logic/mission/mission", "game/bot/custom-ai/logic/mission/missionFactories", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/mission/missionController", "game/bot/custom-ai/logic/common/utils", "game/bot/custom-ai/logic/mission/actionBatcher", "game/bot/custom-ai/logic/map/pathfinding"], function (e, t) {
  "use strict";
  var ActionsApi, GameApi, OrderType, PlayerData, SpeedType, Vector2;
  var Mission, disbandMission, noop, requestSpecificUnits, requestUnits;
  var isPointReachable;
  t && t.id;
  return {
    setters: [
      function (A) {
        ActionsApi = A.ActionsApi;
        GameApi = A.GameApi;
        OrderType = A.OrderType;
        PlayerData = A.PlayerData;
        SpeedType = A.SpeedType;
        Vector2 = A.Vector2;
      },
      function (B) {
        Mission = B.Mission;
        disbandMission = B.disbandMission;
        noop = B.noop;
        requestSpecificUnits = B.requestSpecificUnits;
        requestUnits = B.requestUnits;
      },
      function () {},
      function () {},
      function () {},
      function () {},
      function () {},
      function (PF) {
        isPointReachable = PF.isPointReachable;
      },
    ],
    execute: function () {

      var DEPLOY_COOLDOWN_TICKS = 30;
      var MOVE_TO_BASE_TICKS = 120;
      var DEPLOY_SEARCH_RADIUS = 15;
      var MAX_SEARCH_ATTEMPTS = 50;
      var MAX_MISSION_DURATION_TICKS = 3600;
      var NEW_MCV_REQUEST_COOLDOWN_TICKS = 900;
      var MAX_EXPANSION_BASES = 3;

      function generateSearchCandidates(gameApi, centerX, centerY, radius) {
        var candidates = [];
        var mapApi = gameApi.mapApi;
        for (var r = 1; r <= radius; r++) {
          for (var dx = -r; dx <= r; dx++) {
            for (var dy = -r; dy <= r; dy++) {
              if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
              var x = centerX + dx;
              var y = centerY + dy;
              var tile = mapApi.getTile(x, y);
              if (!tile) continue;
              if (!mapApi.isPassableTile(tile, SpeedType.Track, false, false)) continue;
              var objects = mapApi.getObjectsOnTile(tile);
              if (objects.length > 0) continue;
              candidates.push(new Vector2(x, y));
            }
          }
        }
        return candidates;
      }

      // ============================================================
      // 计算安全的分基地扩展点：远离敌人、可通行、无占用、路径可达
      // expansionIndex 用于让多辆 MCV 去不同方向扩展
      // ============================================================
      var calculateExpansionPoint = function (gameApi, playerData, matchAwareness, expansionIndex) {
        var myBase = playerData.startLocation;
        var mapSize = gameApi.mapApi.getRealMapSize();
        var mapW = mapSize.width || mapSize.w || 0;
        var mapH = mapSize.height || mapSize.h || 0;

        // 获取敌方中心点
        var enemyCenter = null;
        try {
          var enemyPlayers = gameApi.getPlayers()
            .filter(function (p) { return p !== playerData.name && !gameApi.areAlliedPlayers(playerData.name, p); });
          if (enemyPlayers.length > 0) {
            var sumX = 0, sumY = 0;
            enemyPlayers.forEach(function (p) {
              var data = gameApi.getPlayerData(p);
              sumX += data.startLocation.x;
              sumY += data.startLocation.y;
            });
            enemyCenter = { x: sumX / enemyPlayers.length, y: sumY / enemyPlayers.length };
          }
        } catch (_) {}

        if (!enemyCenter) {
          var angle = (expansionIndex || 0) * 2.094;
          var dist = 20;
          return new Vector2(
            Math.max(5, Math.min(mapW - 5, Math.round(myBase.x + Math.cos(angle) * dist))),
            Math.max(5, Math.min(mapH - 5, Math.round(myBase.y + Math.sin(angle) * dist)))
          );
        }

        // 远离敌人的方向
        var dx = myBase.x - enemyCenter.x;
        var dy = myBase.y - enemyCenter.y;
        var len = Math.sqrt(dx * dx + dy * dy);
        if (len < 1) len = 1;
        var awayX = dx / len;
        var awayY = dy / len;

        // 垂直方向（侧翼）
        var perpX = -awayY;
        var perpY = awayX;

        // 按扩展索引选择不同方向：0=远离敌人, 1=左翼, 2=右翼, 3=左后, 4=右后
        var directions = [
          { x: awayX, y: awayY },
          { x: perpX, y: perpY },
          { x: -perpX, y: -perpY },
          { x: (awayX + perpX) * 0.707, y: (awayY + perpY) * 0.707 },
          { x: (awayX - perpX) * 0.707, y: (awayY - perpY) * 0.707 },
        ];

        var dirIdx = (expansionIndex || 0) % directions.length;
        var dir = directions[dirIdx];
        var distances = [20, 25, 15, 30, 18, 22, 28];
        var baseDistToEnemy = Math.sqrt(
          (myBase.x - enemyCenter.x) * (myBase.x - enemyCenter.x) +
          (myBase.y - enemyCenter.y) * (myBase.y - enemyCenter.y)
        );

        // 主方向 + 距离组合
        for (var di = 0; di < distances.length; di++) {
          var cx = Math.round(myBase.x + dir.x * distances[di]);
          var cy = Math.round(myBase.y + dir.y * distances[di]);
          cx = Math.max(3, Math.min(mapW - 3, cx));
          cy = Math.max(3, Math.min(mapH - 3, cy));
          var tile = gameApi.mapApi.getTile(cx, cy);
          if (!tile) continue;
          if (!gameApi.mapApi.isPassableTile(tile, SpeedType.Track, false, false)) continue;
          var objects = gameApi.mapApi.getObjectsOnTile(tile);
          if (objects.length > 0) continue;
          // 距离敌人不能比主基地更近（至少80%）
          var distToEnemy = Math.sqrt(
            (cx - enemyCenter.x) * (cx - enemyCenter.x) +
            (cy - enemyCenter.y) * (cy - enemyCenter.y)
          );
          if (distToEnemy < baseDistToEnemy * 0.8) continue;
          // 检查路径可达性
          if (isPointReachable && !isPointReachable(gameApi, myBase, new Vector2(cx, cy), SpeedType.Track, 6)) continue;
          return new Vector2(cx, cy);
        }

        // 备选：尝试所有方向
        for (var dj = 0; dj < directions.length; dj++) {
          for (var dk = 0; dk < distances.length; dk++) {
            var fx = Math.round(myBase.x + directions[dj].x * distances[dk]);
            var fy = Math.round(myBase.y + directions[dj].y * distances[dk]);
            fx = Math.max(3, Math.min(mapW - 3, fx));
            fy = Math.max(3, Math.min(mapH - 3, fy));
            var ftile = gameApi.mapApi.getTile(fx, fy);
            if (!ftile) continue;
            if (!gameApi.mapApi.isPassableTile(ftile, SpeedType.Track, false, false)) continue;
            var fobjects = gameApi.mapApi.getObjectsOnTile(ftile);
            if (fobjects.length > 0) continue;
            if (isPointReachable && !isPointReachable(gameApi, myBase, new Vector2(fx, fy), SpeedType.Track, 6)) continue;
            return new Vector2(fx, fy);
          }
        }

        // 最终回退：基地附近远离敌人方向
        return new Vector2(
          Math.max(3, Math.min(mapW - 3, Math.round(myBase.x + awayX * 12))),
          Math.max(3, Math.min(mapH - 3, Math.round(myBase.y + awayY * 12)))
        );
      };

      var ExpansionMission = /** @class */ (function (Mission) {
        function ExpansionMission(uniqueName, priority, selectedMcv, logger, isExpanding) {
          Mission.call(this, uniqueName, logger);
          this.priority = priority;
          this.selectedMcv = selectedMcv;
          this.hasAttemptedDeployWith = null;
          this.isExpanding = isExpanding || false;
          this.deployAttemptCount = 0;
          this.searchCandidates = [];
          this.searchIndex = 0;
          this.expansionPoint = null;
          this.missionStartTick = -1;
        }
        ExpansionMission.prototype = Object.create(Mission.prototype);
        ExpansionMission.prototype.constructor = ExpansionMission;

        ExpansionMission.prototype.setExpansionPoint = function (point) {
          this.expansionPoint = point;
        };

        // 锁定MCV单位，防止被其他任务（攻击/防御）抢走
        ExpansionMission.prototype.isUnitsLocked = function () { return true; };

        ExpansionMission.prototype._onAiUpdate = function (gameApi, actionsApi, playerData, matchAwareness, actionBatcher) {
          if (this.missionStartTick < 0) this.missionStartTick = gameApi.getCurrentTick();

          // 任务超时检测：防止MCV卡在不可达区域无限循环
          if (gameApi.getCurrentTick() - this.missionStartTick > MAX_MISSION_DURATION_TICKS) {
            this.logger("[EXPAND] 任务超时(" + MAX_MISSION_DURATION_TICKS + "tick)，解散: " + this.getUniqueName());
            return disbandMission();
          }

          var mcvTypes = gameApi.getGeneralRules().baseUnit || ["AMCV", "SMCV", "PCV"];
          var mcvs = this.getUnitsOfTypes.apply(this, [gameApi].concat(mcvTypes));
          if (mcvs.length === 0) {
            if (this.hasAttemptedDeployWith !== null) return disbandMission();
            if (this.selectedMcv) {
              return requestSpecificUnits([this.selectedMcv], this.priority);
            } else {
              return requestUnits(mcvTypes, this.priority);
            }
          }
          var mcv = mcvs[0];

          if (!this.isExpanding) {
            // 无基地：立即展开（初始部署）
            if (!this.hasAttemptedDeployWith || gameApi.getCurrentTick() > this.hasAttemptedDeployWith.gameTick + DEPLOY_COOLDOWN_TICKS) {
              this.logger("[EXPAND] 初始MCV就地展开");
              actionsApi.orderUnits(mcvs.map(function (mcv) { return mcv.id; }), OrderType.DeploySelected);
              this.hasAttemptedDeployWith = { unitId: mcv.id, gameTick: gameApi.getCurrentTick() };
            }
          } else {
            // 有基地：移动到安全扩展点再展开
            if (!this.hasAttemptedDeployWith) {
              // 优先使用预设扩展点，否则实时计算
              var targetPoint = this.expansionPoint;
              if (!targetPoint) {
                var cyUnits = gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.constructionYard; });
                targetPoint = calculateExpansionPoint(gameApi, playerData, matchAwareness, cyUnits.length);
              }
              if (targetPoint && targetPoint.x >= 0 && targetPoint.y >= 0) {
                this.logger("[EXPAND] " + this.getUniqueName() + " MCV移动到扩展点 (" + targetPoint.x + "," + targetPoint.y + ")");
                actionsApi.orderUnits([mcv.id], OrderType.Move, undefined, targetPoint.x, targetPoint.y);
              } else {
                this.logger("[EXPAND] " + this.getUniqueName() + " 无可用扩展点，就地展开");
                actionsApi.orderUnits([mcv.id], OrderType.DeploySelected);
              }
              this.hasAttemptedDeployWith = { unitId: mcv.id, gameTick: gameApi.getCurrentTick(), stage: "move" };
              this.deployAttemptCount = 0;
              this.searchCandidates = [];
              this.searchIndex = 0;
            } else {
              var elapsed = gameApi.getCurrentTick() - this.hasAttemptedDeployWith.gameTick;
              var stage = this.hasAttemptedDeployWith.stage || "deploy";

              if (stage === "move" && elapsed > MOVE_TO_BASE_TICKS) {
                // 移动超时，尝试展开
                this.logger("[EXPAND] " + this.getUniqueName() + " 移动阶段超时(" + elapsed + "tick)，尝试展开");
                actionsApi.orderUnits([mcv.id], OrderType.DeploySelected);
                this.hasAttemptedDeployWith = { unitId: mcv.id, gameTick: gameApi.getCurrentTick(), stage: "deploy" };
              } else if (stage === "deploy" && elapsed > DEPLOY_COOLDOWN_TICKS) {
                this.deployAttemptCount++;

                if (this.deployAttemptCount > MAX_SEARCH_ATTEMPTS + 5) {
                  // 展开完全失败，解散任务让工厂重新规划
                  this.logger("[EXPAND] " + this.getUniqueName() + " 展开完全失败(" + this.deployAttemptCount + "次)，解散任务");
                  return disbandMission();
                }

                if (this.deployAttemptCount > MAX_SEARCH_ATTEMPTS) {
                  // 搜索次数耗尽，最后尝试一次展开
                  this.logger("[EXPAND] " + this.getUniqueName() + " 搜索次数耗尽，最终展开尝试");
                  actionsApi.orderUnits([mcv.id], OrderType.DeploySelected);
                  this.hasAttemptedDeployWith.gameTick = gameApi.getCurrentTick();
                } else {
                  // 在MCV附近搜索可展开位置
                  if (!this.searchCandidates.length) {
                    this.searchCandidates = generateSearchCandidates(gameApi, mcv.tile.rx, mcv.tile.ry, DEPLOY_SEARCH_RADIUS);
                    this.searchIndex = 0;
                    this.logger("[EXPAND] " + this.getUniqueName() + " 搜索到 " + this.searchCandidates.length + " 个候选位置 (半径" + DEPLOY_SEARCH_RADIUS + ")");
                  }
                  if (this.searchIndex < this.searchCandidates.length) {
                    var candidate = this.searchCandidates[this.searchIndex++];
                    this.logger("[EXPAND] " + this.getUniqueName() + " 移动到候选位置 (" + candidate.x + "," + candidate.y + ") [" + this.searchIndex + "/" + this.searchCandidates.length + "]");
                    actionsApi.orderUnits([mcv.id], OrderType.Move, undefined, candidate.x, candidate.y);
                    this.hasAttemptedDeployWith = { unitId: mcv.id, gameTick: gameApi.getCurrentTick(), stage: "move" };
                  } else {
                    // 候选位置用尽，强制展开并重置搜索（扩大半径重试一次）
                    this.logger("[EXPAND] " + this.getUniqueName() + " 候选位置用尽，重置搜索");
                    this.searchCandidates = [];
                    actionsApi.orderUnits([mcv.id], OrderType.DeploySelected);
                    this.hasAttemptedDeployWith.gameTick = gameApi.getCurrentTick();
                  }
                }
              }
            }
          }
          return noop();
        };
        ExpansionMission.prototype.getGlobalDebugText = function () { return "Expand with MCV " + this.selectedMcv; };
        ExpansionMission.prototype.getPriority = function () { return this.priority; };
        return ExpansionMission;
      }(Mission));
      e("ExpansionMission", ExpansionMission);

      // ============================================================
      // 扩展任务工厂
      // 修复：去重检查、MCV请求冷却、扩展上限、不同MCV去不同方向
      // ============================================================
      var ExpansionMissionFactory = /** @class */ (function () {
        function ExpansionMissionFactory() {
          this.lastNewMcvRequestTick = -NEW_MCV_REQUEST_COOLDOWN_TICKS;
        }
        ExpansionMissionFactory.prototype.getName = function () { return "ExpansionMissionFactory"; };
        ExpansionMissionFactory.prototype.maybeCreateMissions = function (gameApi, playerData, matchAwareness, missionController, logger) {
          var mcvs = gameApi.getVisibleUnits(playerData.name, "self", function (r) {
            return gameApi.getGeneralRules().baseUnit.indexOf(r.name) !== -1;
          });
          var cyUnits = gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.constructionYard; });
          var hasCY = cyUnits.length > 0;
          var cyCount = cyUnits.length;

          // 获取已有扩展任务
          var activeExpansionMissions = missionController.getMissions().filter(function (m) {
            return m.getUniqueName().indexOf("expand-with-") === 0;
          });

          // 统计已在扩展任务中的单位ID，避免重复创建
          var unitsInExpansion = {};
          activeExpansionMissions.forEach(function (m) {
            m.getUnitIds().forEach(function (id) { unitsInExpansion[id] = true; });
          });

          // 为未分配的MCV创建扩展任务
          mcvs.forEach(function (mcv) {
            if (unitsInExpansion[mcv]) return;  // 已在扩展任务中，跳过
            var expansionIndex = cyCount + activeExpansionMissions.length;
            var expansionPoint = calculateExpansionPoint(gameApi, playerData, matchAwareness, expansionIndex);
            var mission = new ExpansionMission("expand-with-" + mcv, 100, mcv, logger, hasCY);
            mission.setExpansionPoint(expansionPoint);
            if (missionController.addMission(mission)) {
              logger("[EXPAND] 创建扩展任务 expand-with-" + mcv + " 扩展点=" +
                (expansionPoint ? "(" + expansionPoint.x + "," + expansionPoint.y + ")" : "null") +
                " 已有基地=" + cyCount + " 方向索引=" + expansionIndex);
            }
          });

          // 无MCV且无活跃扩展任务时，请求生产新MCV（带冷却+上限）
          if (mcvs.length === 0 && activeExpansionMissions.length === 0) {
            if (cyCount >= MAX_EXPANSION_BASES) return;  // 达到扩展上限
            if (gameApi.getCurrentTick() - this.lastNewMcvRequestTick < NEW_MCV_REQUEST_COOLDOWN_TICKS) return;

            var hasWarFactory = gameApi.getVisibleUnits(playerData.name, "self", function (r) {
              return r.name === "GAWEAP" || r.name === "NAWEAP" || r.name === "YAWEAP";
            }).length > 0;
            if (hasWarFactory) {
              var expansionIndex = cyCount;
              var expansionPoint = calculateExpansionPoint(gameApi, playerData, matchAwareness, expansionIndex);
              var mission = new ExpansionMission("expand-with-new", 100, null, logger, hasCY);
              mission.setExpansionPoint(expansionPoint);
              if (missionController.addMission(mission)) {
                logger("[EXPAND] 请求生产新MCV用于扩展 扩展点=" +
                  (expansionPoint ? "(" + expansionPoint.x + "," + expansionPoint.y + ")" : "null") +
                  " 已有基地=" + cyCount + "/" + MAX_EXPANSION_BASES);
                this.lastNewMcvRequestTick = gameApi.getCurrentTick();
              }
            }
          }
        };
        ExpansionMissionFactory.prototype.onMissionFailed = function () {};
        return ExpansionMissionFactory;
      }());
      e("ExpansionMissionFactory", ExpansionMissionFactory);
    },
  };
});
