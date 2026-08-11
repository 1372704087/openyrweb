// === Custom AI module: game/bot/custom-ai/logic/mission/missions/attackMission ===
System.register("game/bot/custom-ai/logic/mission/missions/attackMission", ["game/api/index", "game/bot/custom-ai/logic/mission/missions/squads/combatSquad", "game/bot/custom-ai/logic/mission/mission", "game/bot/custom-ai/logic/mission/missionFactories", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/mission/missionController", "game/bot/custom-ai/logic/mission/missions/retreatMission", "game/bot/custom-ai/logic/common/utils", "game/bot/custom-ai/logic/mission/actionBatcher", "game/bot/custom-ai/logic/composition/sovietCompositions", "game/bot/custom-ai/logic/composition/yuriCompositions", "game/bot/custom-ai/logic/composition/alliedCompositions", "game/bot/custom-ai/logic/composition/common", "game/bot/custom-ai/logic/mission/missions/squads/common", "game/bot/custom-ai/logic/map/pathfinding", "game/bot/custom-ai/logic/composition/sovietNavalCompositions",
  "game/bot/custom-ai/logic/composition/alliedNavalCompositions",
  "game/bot/custom-ai/logic/composition/yuriNavalCompositions",
  "game/bot/custom-ai/logic/mission/missions/airRaidMission",
  "game/bot/custom-ai/logic/mission/missions/navalAssaultMission"
], function (e, t) {
  "use strict";
  var ActionsApi, GameApi, ObjectType, PlayerData, SideType, UnitData, Vector2, SpeedType;
  var CombatSquad;
  var Mission, disbandMission, noop, requestUnits;
  var RetreatMission;
  var DebugLogger, countBy, isOwnedByNeutral, maxBy;
  var getSovietComposition;
  var getYuriComposition;
  var getAlliedCompositions;
  var manageMoveMicro;
  var isPointReachable;
  var getSovietNavalCompositions;
  var getAlliedNavalCompositions;
  var getYuriNavalCompositions;
  var AirRaidMission;
  var NavalAssaultMission;
  t && t.id;
  return {
    setters: [
      function (A) {
        ActionsApi = A.ActionsApi;
        GameApi = A.GameApi;
        ObjectType = A.ObjectType;
        PlayerData = A.PlayerData;
        SideType = A.SideType;
        UnitData = A.UnitData;
        Vector2 = A.Vector2;
        SpeedType = A.SpeedType;
      },
      function (B) {
        CombatSquad = B.CombatSquad;
      },
      function (C) {
        Mission = C.Mission;
        disbandMission = C.disbandMission;
        noop = C.noop;
        requestUnits = C.requestUnits;
      },
      function () {},
      function () {},
      function () {},
      function (G) {
        RetreatMission = G.RetreatMission;
      },
      function (H) {
        DebugLogger = H.DebugLogger;
        countBy = H.countBy;
        isOwnedByNeutral = H.isOwnedByNeutral;
        maxBy = H.maxBy;
      },
      function () {},
      function (J) {
        getSovietComposition = J.getSovietComposition;
      },
      function (JY) {
        getYuriComposition = JY.getYuriComposition;
      },
      function (K) {
        getAlliedCompositions = K.getAlliedCompositions;
      },
      function () {},
      function (M) {
        manageMoveMicro = M.manageMoveMicro;
      },
      function (N) {
        isPointReachable = N.isPointReachable;
      },
      function (O) {
        getSovietNavalCompositions = O.getNavalCompositions;
      },
      function (P) {
        getAlliedNavalCompositions = P.getNavalCompositions;
      },
      function (Q) {
        getYuriNavalCompositions = Q.getNavalCompositions;
      },
      function (R) {
        AirRaidMission = R.AirRaidMission;
      },
      function (S) {
        NavalAssaultMission = S.NavalAssaultMission;
      },
    ],
    execute: function () {

      var AttackFailReason = { NoTargets: 0, DefenceTooStrong: 1 };
      e("AttackFailReason", AttackFailReason);

      var AttackMissionState = { Preparing: 0, Attacking: 1, Retreating: 2 };

      var NO_TARGET_RETARGET_TICKS = 120;
      var NO_TARGET_IDLE_TIMEOUT_TICKS = 300;

      function calculateTargetComposition(gameApi, playerData, matchAwareness, useNaval) {
        if (useNaval === void 0) { useNaval = false; }
        if (!playerData.country) throw new Error("player " + playerData.name + " has no country");
        if (useNaval) {
          if (playerData.country.side === SideType.ThirdSide) {
            return getYuriNavalCompositions(gameApi, playerData, matchAwareness);
          }
          return playerData.country.side === SideType.Nod
            ? getSovietNavalCompositions(gameApi, playerData, matchAwareness)
            : getAlliedNavalCompositions(gameApi, playerData, matchAwareness);
        }
        if (playerData.country.side === SideType.ThirdSide) {
          return getYuriComposition(gameApi, playerData, matchAwareness);
        }
        return playerData.country.side === SideType.Nod
          ? getSovietComposition(gameApi, playerData, matchAwareness)
          : getAlliedCompositions(gameApi, playerData, matchAwareness);
      }

      var ATTACK_MISSION_PRIORITY_RAMP = 1.12;
      var ATTACK_MISSION_MAX_PRIORITY = 90;

      var AttackMission = /** @class */ (function (Mission) {
        function AttackMission(uniqueName, priority, rallyArea, attackArea, radius, composition, logger) {
          Mission.call(this, uniqueName, logger);
          this.priority = priority;
          this.rallyArea = rallyArea;
          this.attackArea = attackArea;
          this.radius = radius;
          this.composition = composition;
          this.hasTriedLandAttack = false;
          this.landAttackFailCount = 0;
          this.MAX_LAND_ATTACK_ATTEMPTS = 1;
          this.isNavalMission = false;
          this.lastTargetSeenAt = 0;
          this.hasPickedNewTarget = false;
          this.state = AttackMissionState.Preparing;
          this.squad = new CombatSquad(rallyArea, attackArea, radius);
        }
        AttackMission.prototype = Object.create(Mission.prototype);
        AttackMission.prototype.constructor = AttackMission;

        AttackMission.prototype.shouldSwitchToNaval = function (gameApi) {
          this.logger("shouldSwitchToNaval? tick=" + gameApi.getCurrentTick() + " | isNavalMission=" + this.isNavalMission + " | landFails=" + this.landAttackFailCount + "/" + this.MAX_LAND_ATTACK_ATTEMPTS);
          this.logger("    rallyArea=(" + this.rallyArea.x + "," + this.rallyArea.y + ") attackArea=(" + this.attackArea.x + "," + this.attackArea.y + ")");
          if (this.isNavalMission) { this.logger("    Already naval mission, skip switch check."); return false; }
          var reachable = isPointReachable(gameApi, this.rallyArea, this.attackArea, SpeedType.Track, 6);
          this.logger("    pathReachable=" + reachable);
          if (!reachable) { this.logger("目标点陆地单位无法到达，切换为海军编队"); return true; }
          if (this.landAttackFailCount >= this.MAX_LAND_ATTACK_ATTEMPTS) { this.logger("陆地进攻失败次数过多，切换为海军编队"); return true; }
          return false;
        };

        AttackMission.prototype._onAiUpdate = function (gameApi, actionsApi, playerData, matchAwareness, actionBatcher) {
          switch (this.state) {
            case AttackMissionState.Preparing: return this.handlePreparingState(gameApi, actionsApi, playerData, matchAwareness, actionBatcher);
            case AttackMissionState.Attacking: return this.handleAttackingState(gameApi, actionsApi, playerData, matchAwareness, actionBatcher);
            case AttackMissionState.Retreating: return this.handleRetreatingState(gameApi, actionsApi, playerData, matchAwareness, actionBatcher);
          }
        };

        AttackMission.prototype.handlePreparingState = function (gameApi, actionsApi, playerData, matchAwareness, actionBatcher) {
          if (!this.isNavalMission && this.shouldSwitchToNaval(gameApi)) {
            this.isNavalMission = true;
            this.composition = calculateTargetComposition(gameApi, playerData, matchAwareness, true);
            this.logger("已切换为海军编队");
            this.logger("[NAVAL_DEBUG] 海军编队组成: " + JSON.stringify(this.composition));
            return noop();
          }
          var currentComposition = countBy(this.getUnitsGameObjectData(gameApi), function (unit) { return unit.name; });
          if (this.isNavalMission) {
            this.logger("[NAVAL_DEBUG] 当前海军单位组成: " + JSON.stringify(currentComposition));
            this.logger("[NAVAL_DEBUG] 目标海军编队组成: " + JSON.stringify(this.composition));
          }
          var missingUnits = Object.entries(this.composition).filter(function (_a) {
            var unitType = _a[0], targetAmount = _a[1];
            return !currentComposition[unitType] || currentComposition[unitType] < targetAmount;
          });
          if (missingUnits.length > 0) {
            if (this.isNavalMission) { this.logger("[NAVAL_DEBUG] 缺少海军单位: " + JSON.stringify(missingUnits)); }
            this.priority = Math.min(this.priority * ATTACK_MISSION_PRIORITY_RAMP, ATTACK_MISSION_MAX_PRIORITY);
            return requestUnits(missingUnits.map(function (_a) { return _a[0]; }), this.priority);
          } else {
            if (this.isNavalMission) { this.logger("[NAVAL_DEBUG] 海军编队准备完毕，开始攻击阶段"); }
            this.priority = 1;
            this.state = AttackMissionState.Attacking;
            return noop();
          }
        };

        AttackMission.prototype.handleAttackingState = function (gameApi, actionsApi, playerData, matchAwareness, actionBatcher) {
          if (this.getUnitIds().length === 0) {
            if (!this.isNavalMission) {
              this.landAttackFailCount++;
              if (this.shouldSwitchToNaval(gameApi)) {
                this.state = AttackMissionState.Preparing;
                return noop();
              }
            }
            this.state = AttackMissionState.Retreating;
            return noop();
          }

          var foundTargets = matchAwareness
            .getHostilesNearPoint2d(this.attackArea, this.radius)
            .map(function (unit) { return gameApi.getUnitData(unit.unitId); })
            .filter(function (unit) { return !isOwnedByNeutral(unit); });

          var update = this.squad.onAiUpdate(gameApi, actionsApi, actionBatcher, playerData, this, matchAwareness, this.logger);
          if (update.type !== "noop") return update;

          if (foundTargets.length > 0) {
            this.lastTargetSeenAt = gameApi.getCurrentTick();
            this.hasPickedNewTarget = false;
          } else if (gameApi.getCurrentTick() > this.lastTargetSeenAt + NO_TARGET_IDLE_TIMEOUT_TICKS) {
            return disbandMission(AttackFailReason.NoTargets);
          } else if (!this.hasPickedNewTarget && gameApi.getCurrentTick() > this.lastTargetSeenAt + NO_TARGET_RETARGET_TICKS) {
            var newTarget = generateTarget(gameApi, playerData, matchAwareness, false, this.logger);
            if (newTarget) {
              this.squad.setAttackArea(newTarget);
              this.hasPickedNewTarget = true;
            }
          }
          return noop();
        };

        AttackMission.prototype.handleRetreatingState = function (gameApi, actionsApi, playerData, matchAwareness, actionBatcher) {
          this.getUnits(gameApi).forEach(function (unitId) {
            actionBatcher.push(manageMoveMicro(unitId, matchAwareness.getMainRallyPoint()));
          });
          return disbandMission();
        };

        AttackMission.prototype.getGlobalDebugText = function () { return this.squad.getGlobalDebugText() || "<none>"; };
        AttackMission.prototype.getState = function () { return this.state; };
        AttackMission.prototype.isUnitsLocked = function () { return this.state !== AttackMissionState.Preparing; };
        AttackMission.prototype.getPriority = function () { return this.priority; };
        return AttackMission;
      }(Mission));
      e("AttackMission", AttackMission);

      // 高价值战略建筑优先级表 — 数值越高越优先攻击
      var STRATEGIC_BUILDING_PRIORITY = {
        // 超级武器
        NAMISL: 60000, GAWEAT: 60000, YAGNTC: 60000,
        // 建造场（基地核心）
        GACNST: 50000, NAACNST: 50000, YACNST: 50000,
        // 作战实验室（科技核心）
        GATECH: 35000, NATECH: 35000, YATECH: 35000,
        // 战车工厂（生产核心）
        GAWEAP: 30000, NAWEAP: 30000, YAWEAP: 30000,
        // 矿石精炼厂（经济核心）
        GAREFN: 25000, NAREFN: 25000, YAREFN: 25000,
        // 核电站/生化反应堆
        NANRCT: 20000, NATBNK: 18000,
        // 发电厂
        GAPOWR: 15000, NAPOWR: 15000, YAPOWR: 15000,
        // 兵营
        GAPILE: 15000, NAHAND: 15000, YABRCK: 15000,
        // 空军指挥/雷达
        GAAIRC: 12000, AMRADR: 12000, NARADR: 12000, NAPSIS: 12000,
        // 海军船坞
        GAYARD: 12000, NAYARD: 12000, YAYARD: 12000,
        // 克隆缸
        YACOMM: 10000,
        // 维修厂
        GADEPT: 5000, NADEPT: 5000, YADEPT: 5000,
        // 防御建筑（强力）— 磁暴线圈/光棱塔/心灵控制塔
        TESLA: 8000, ATESLA: 8000, YAPSY: 8000,
        // 防御建筑（普通）— 机枪碉堡/哨戒炮/高射炮/爱国者/盖特机炮
        GAPILL: 4000, NALASR: 4000, NAFLAK: 4000, NASAM: 4000, YAPSID: 5000, YAGRND: 4000,
      };

      var getTargetWeight = function (unitData, tryFocusHarvester) {
        if (tryFocusHarvester && unitData.rules.harvester) return 150000;
        if (unitData.type === ObjectType.Building) {
          var strategicPriority = STRATEGIC_BUILDING_PRIORITY[unitData.name];
          if (strategicPriority) return strategicPriority + unitData.maxHitPoints;
          return unitData.maxHitPoints * 10;
        }
        return unitData.maxHitPoints;
      };

      // 威胁规避：评估目标点附近的敌方防御强度，返回权重乘数（0.3~1.0，更激进）
      var THREAT_ASSESSMENT_RADIUS = 5;
      var assessTargetThreat = function (gameApi, matchAwareness, targetPoint, excludeUnitId) {
        try {
          var nearbyHostiles = matchAwareness.getHostilesNearPoint2d(targetPoint, THREAT_ASSESSMENT_RADIUS);
          var defensiveBuildings = 0;
          var mobileThreats = 0;
          for (var i = 0; i < nearbyHostiles.length; i++) {
            if (excludeUnitId !== undefined && nearbyHostiles[i].unitId === excludeUnitId) continue;
            var unit = gameApi.getUnitData(nearbyHostiles[i].unitId);
            if (!unit || !unit.rules) continue;
            if (unit.type === ObjectType.Building) {
              // 有武器的建筑视为防御工事
              if (unit.rules.primary || unit.rules.secondary) {
                defensiveBuildings++;
              }
            } else if (unit.rules.isSelectableCombatant) {
              mobileThreats++;
            }
          }
          // 防御建筑威胁权重 3，移动战斗单位威胁权重 1
          var threatScore = defensiveBuildings * 3 + mobileThreats;
          if (threatScore === 0) return 1.0;
          // 威胁惩罚大幅降低，AI更敢于硬冲
          var penalty = Math.max(0.3, 1.0 / (1.0 + threatScore * 0.06));
          return penalty;
        } catch (err) {
          return 1.0;
        }
      };

      // ============================================================
      // 三路走廊系统：将地图按我方→敌方轴线分为上/中/下三条进攻走廊
      // 每条走廊有独立的集结点（偏移到走廊侧翼）和目标筛选区域
      // ============================================================
      var LANE_NAMES = ["top", "mid", "bottom"];
      var LANE_OFFSET_RATIO = 0.25; // 上下走廊偏移量为地图短边的 25%

      // 计算三路走廊信息：返回 {lanes: [{name, rallyPoint, laneAxis}], enemyCenter}
      var computeLanes = function (gameApi, playerData, matchAwareness) {
        var mapSize = gameApi.mapApi.getRealMapSize();
        var mapW = mapSize.width || mapSize.w || 0;
        var mapH = mapSize.height || mapSize.h || 0;
        var myBase = playerData.startLocation;
        var rallyPoint = matchAwareness.getMainRallyPoint();

        // 找敌方中心点
        var enemyCenter = null;
        try {
          var enemyPlayers = gameApi.getPlayers()
            .map(function (p) { return gameApi.getPlayerData(p); })
            .filter(function (p) { return !gameApi.areAlliedPlayers(playerData.name, p.name); });
          if (enemyPlayers.length > 0) {
            var sumX = 0, sumY = 0;
            enemyPlayers.forEach(function (p) { sumX += p.startLocation.x; sumY += p.startLocation.y; });
            enemyCenter = new Vector2(sumX / enemyPlayers.length, sumY / enemyPlayers.length);
          }
        } catch (_) {}
        if (!enemyCenter) enemyCenter = rallyPoint;

        // 进攻轴线方向（我方→敌方）
        var axisDx = enemyCenter.x - myBase.x;
        var axisDy = enemyCenter.y - myBase.y;
        var axisLen = Math.sqrt(axisDx * axisDx + axisDy * axisDy);
        if (axisLen < 1) axisLen = 1;
        // 轴线单位向量
        var ux = axisDx / axisLen;
        var uy = axisDy / axisLen;
        // 垂直方向（左侧为上，右侧为下）
        var perpX = -uy;
        var perpY = ux;

        // 偏移量：地图短边的 25%
        var shortSide = Math.min(mapW, mapH);
        var offset = shortSide * LANE_OFFSET_RATIO;
        if (offset < 8) offset = 8;

        // 集结点距离基地前方的距离
        var rallyDist = Math.min(15, axisLen * 0.2);

        var lanes = LANE_NAMES.map(function (name, idx) {
          var laneMul = idx === 0 ? -1 : (idx === 1 ? 0 : 1); // top=-1, mid=0, bottom=+1
          // 集结点：沿轴线前方 rallyDist，再沿垂直方向偏移 offset*laneMul
          var rpx = Math.round(myBase.x + ux * rallyDist + perpX * offset * laneMul);
          var rpy = Math.round(myBase.y + uy * rallyDist + perpY * offset * laneMul);
          // 钳制到地图范围
          rpx = Math.max(1, Math.min(mapW - 1, rpx));
          rpy = Math.max(1, Math.min(mapH - 1, rpy));
          return {
            name: name,
            rallyPoint: new Vector2(rpx, rpy),
            laneAxis: { perpX: perpX, perpY: perpY, laneMul: laneMul, offset: offset },
            enemyCenter: enemyCenter,
          };
        });
        return { lanes: lanes, enemyCenter: enemyCenter };
      };

      // 判断一个目标点属于哪条走廊（基于垂直方向的投影）
      var getLaneForPoint = function (point, myBase, lanes) {
        if (!lanes || lanes.length === 0) return "mid";
        var laneInfo = lanes[0].laneAxis;
        var perpX = laneInfo.perpX;
        var perpY = laneInfo.perpY;
        var offset = laneInfo.offset;
        // 目标相对于基地的垂直投影
        var dx = point.x - myBase.x;
        var dy = point.y - myBase.y;
        var projection = dx * perpX + dy * perpY;
        // 投影 > offset/2 → bottom, < -offset/2 → top, 否则 mid
        if (projection > offset * 0.4) return "bottom";
        if (projection < -offset * 0.4) return "top";
        return "mid";
      };

      function generateTarget(gameApi, playerData, matchAwareness, includeBaseLocations, logger, lane, lanes) {
        if (includeBaseLocations === void 0) { includeBaseLocations = false; }
        if (lane === void 0) { lane = null; }
        if (lanes === void 0) { lanes = null; }
        var rallyPoint = matchAwareness.getMainRallyPoint();
        // 如果指定了走廊，使用该走廊的集结点作为参考
        if (lane && lanes) {
          for (var li = 0; li < lanes.length; li++) {
            if (lanes[li].name === lane) {
              rallyPoint = lanes[li].rallyPoint;
              break;
            }
          }
        }
        try {
          var tryFocusHarvester = gameApi.generateRandomInt(0, 1) === 0;
          var enemyUnits = gameApi.getVisibleUnits(playerData.name, "enemy")
            .map(function (unitId) { return gameApi.getUnitData(unitId); })
            .filter(function (u) { return !!u && gameApi.getPlayerData(u.owner).isCombatant; });

          // 如果指定了走廊，筛选该走廊内的目标；若筛选后为空则不筛选（避免无目标可打）
          if (lane && lanes) {
            var myBase_1 = playerData.startLocation;
            var laneUnits = enemyUnits.filter(function (u) {
              var pt = new Vector2(u.tile.rx, u.tile.ry);
              return getLaneForPoint(pt, myBase_1, lanes) === lane;
            });
            if (laneUnits.length > 0) {
              enemyUnits = laneUnits;
            }
          }

          var computeWeight = function (u) {
            var weight = getTargetWeight(u, tryFocusHarvester);
            try {
              var targetPoint = new Vector2(u.tile.rx, u.tile.ry);
              if (!isPointReachable(gameApi, rallyPoint, targetPoint, SpeedType.Track, 6)) {
                weight *= 0.3;
              }
              // 距离惩罚：越远权重越低（线性衰减，底限提高到 0.75 倍）
              var dist = rallyPoint.distanceTo(targetPoint);
              if (dist > 0) {
                var maxDist = 200;
                var distFactor = Math.max(0.75, 1 - (dist / maxDist) * 0.25);
                weight *= distFactor;
              }
              // 威胁规避：评估目标附近的敌方防御强度，防御密集的目标权重大幅降低
              var threatPenalty = assessTargetThreat(gameApi, matchAwareness, targetPoint, u.id);
              weight *= threatPenalty;
            } catch (err) { weight *= 0.3; }
            return weight;
          };

          var maxUnit = maxBy(enemyUnits, computeWeight);
          if (maxUnit) {
            var tp = assessTargetThreat(gameApi, matchAwareness, new Vector2(maxUnit.tile.rx, maxUnit.tile.ry), maxUnit.id);
            if (logger) logger("generateTarget: picked " + maxUnit.name + " (id=" + maxUnit.id + ") at (" + maxUnit.tile.rx + "," + maxUnit.tile.ry + ") threatPenalty=" + Math.round(tp * 100) / 100);
            return new Vector2(maxUnit.tile.rx, maxUnit.tile.ry);
          }
          if (includeBaseLocations) {
            var mapApi_1 = gameApi.mapApi;
            var enemyPlayers = gameApi.getPlayers()
              .map(function (p) { return gameApi.getPlayerData(p); })
              .filter(function (otherPlayer) { return !gameApi.areAlliedPlayers(playerData.name, otherPlayer.name); });

            var unexploredEnemyLocations = enemyPlayers.filter(function (otherPlayer) {
              var tile = mapApi_1.getTile(otherPlayer.startLocation.x, otherPlayer.startLocation.y);
              if (!tile) return false;
              return !mapApi_1.isVisibleTile(tile, playerData.name);
            });
            if (unexploredEnemyLocations.length > 0) {
              var idx = gameApi.generateRandomInt(0, unexploredEnemyLocations.length - 1);
              var targetLoc = unexploredEnemyLocations[idx].startLocation;
              if (logger) logger("generateTarget: picked unexplored enemy base at (" + targetLoc.x + "," + targetLoc.y + ")");
              return targetLoc;
            }
          }
        } catch (err) {
          if (logger) logger("generateTarget: ERROR while selecting target: " + err);
        }

        try {
          var baseUnitNames = gameApi.getGeneralRules().baseUnit || [];
          var enemyMcvs = gameApi.getVisibleUnits(playerData.name, "enemy", function (r) { return !!r.deploysInto && baseUnitNames.indexOf(r.name) !== -1; });
          if (enemyMcvs.length > 0) {
            var mcvId = enemyMcvs[0];
            var mcvData = gameApi.getUnitData(mcvId);
            if (mcvData) {
              if (logger) logger("generateTarget: fallback to enemy MCV " + mcvData.name + " (id=" + mcvData.id + ") at (" + mcvData.tile.rx + "," + mcvData.tile.ry + ")");
              return new Vector2(mcvData.tile.rx, mcvData.tile.ry);
            }
          }
        } catch (_) {}

        return null;
      }

      // 多线作战参数
      var VISIBLE_TARGET_ATTACK_COOLDOWN_TICKS = 3;
      var BASE_ATTACK_COOLDOWN_TICKS = 1;
      var AIR_RAID_PRIORITY = 100;
      var NAVAL_ASSAULT_PRIORITY = 95;
      // 同时允许的最大地面进攻任务数（Preparing 状态）
      var MAX_CONCURRENT_GROUND_ATTACKS = 20;
      // 同时允许的最大空袭任务数
      var MAX_CONCURRENT_AIR_RAIDS = 10;
      // 同时允许的最大海军突击任务数
      var MAX_CONCURRENT_NAVAL_ASSAULTS = 10;

      function hasAirProductionForSelector(gameApi, playerData) {
        if (!playerData.country) return false;
        if (playerData.country.side === SideType.GDI) {
          return gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.name === "GAAIRC" || r.name === "AMRADR"; }).length > 0;
        }
        if (playerData.country.side === SideType.Nod) {
          return gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.name === "NARADR"; }).length > 0;
        }
        return false;
      }

      function hasNavalYardForSelector(gameApi, playerData) {
        return gameApi.getVisibleUnits(playerData.name, "self", function (r) {
          return r.name === "GAYARD" || r.name === "NAYARD" || r.name === "YAYARD";
        }).length > 0;
      }

      function calculateNavalAssaultComposition(gameApi, playerData, matchAwareness) {
        if (!playerData.country) return {};
        if (playerData.country.side === SideType.ThirdSide) {
          return getYuriNavalCompositions(gameApi, playerData, matchAwareness);
        }
        return playerData.country.side === SideType.Nod
          ? getSovietNavalCompositions(gameApi, playerData, matchAwareness)
          : getAlliedNavalCompositions(gameApi, playerData, matchAwareness);
      }

      var AttackMissionFactory = /** @class */ (function () {
        function AttackMissionFactory() {
          this.lastAttackAt = -VISIBLE_TARGET_ATTACK_COOLDOWN_TICKS;
          this.groundLaneIndex = 0; // 地面进攻走廊轮转计数器
        }
        AttackMissionFactory.prototype.getName = function () { return "AttackMissionFactory"; };

        AttackMissionFactory.prototype.maybeCreateMissions = function (gameApi, playerData, matchAwareness, missionController, logger) {
          if (gameApi.getCurrentTick() < this.lastAttackAt + VISIBLE_TARGET_ATTACK_COOLDOWN_TICKS) return;

          var activeMissions = missionController.getMissions();
          var currentTick = gameApi.getCurrentTick();

          // 计算三路走廊信息
          var laneData = computeLanes(gameApi, playerData, matchAwareness);
          var lanes = laneData.lanes;

          // 统计当前各类进攻任务数量
          var groundPreparingCount = activeMissions.filter(function (m) {
            return m instanceof AttackMission && m.getState() === AttackMissionState.Preparing;
          }).length;
          var activeAirRaids = activeMissions.filter(function (m) {
            return m.getUniqueName().indexOf("airraid-") === 0;
          }).length;
          var activeNavalAssaults = activeMissions.filter(function (m) {
            return m.getUniqueName().indexOf("naval-assault-") === 0;
          }).length;

          // —— 空袭线：独立判断，不阻塞其他进攻 ——
          if (hasAirProductionForSelector(gameApi, playerData) && activeAirRaids < MAX_CONCURRENT_AIR_RAIDS) {
            var airMissionName = "airraid-" + currentTick;
            var tryAirRaid = missionController.addMission(new AirRaidMission(airMissionName, AIR_RAID_PRIORITY, logger));
            if (tryAirRaid) {
              logger("[MULTI_FRONT] 启动空袭任务 " + airMissionName);
              this.lastAttackAt = currentTick;
            }
          }

          // —— 海军线：独立判断，不阻塞其他进攻 ——
          if (hasNavalYardForSelector(gameApi, playerData) && activeNavalAssaults < MAX_CONCURRENT_NAVAL_ASSAULTS) {
            var navalComposition = calculateNavalAssaultComposition(gameApi, playerData, matchAwareness);
            if (Object.keys(navalComposition).length > 0) {
              var navalMissionName = "naval-assault-" + currentTick;
              var tryNavalAssault = missionController.addMission(new NavalAssaultMission(navalMissionName, NAVAL_ASSAULT_PRIORITY, navalComposition, logger));
              if (tryNavalAssault) {
                logger("[MULTI_FRONT] 启动海军突击任务 " + navalMissionName);
                this.lastAttackAt = currentTick;
              }
            }
          }

          // —— 地面线：三路走廊轮转进攻 ——
          if (groundPreparingCount < MAX_CONCURRENT_GROUND_ATTACKS) {
            // 轮转选择走廊：top → mid → bottom → top ...
            var selectedLane = LANE_NAMES[this.groundLaneIndex % LANE_NAMES.length];
            this.groundLaneIndex++;
            var laneRallyPoint = lanes[LANE_NAMES.indexOf(selectedLane)].rallyPoint;

            var attackRadius = 15;
            var includeEnemyBases = currentTick > this.lastAttackAt + BASE_ATTACK_COOLDOWN_TICKS;
            var attackArea = generateTarget(gameApi, playerData, matchAwareness, includeEnemyBases, logger, selectedLane, lanes);
            if (attackArea) {

            var squadName = "attack_" + selectedLane + "_" + currentTick;
            var composition = calculateTargetComposition(gameApi, playerData, matchAwareness);

            var tryAttack = missionController.addMission(
              new AttackMission(squadName, 1, laneRallyPoint, attackArea, attackRadius, composition, logger)
                .then(function (unitIds, reason) {
                  missionController.addMission(new RetreatMission("retreat-from-" + squadName + currentTick, matchAwareness.getMainRallyPoint(), unitIds, logger));
                }),
            );
            if (tryAttack) {
              logger("[MULTI_FRONT] 启动" + selectedLane + "路地面进攻 " + squadName + " 集结(" + laneRallyPoint.x + "," + laneRallyPoint.y + ") 目标(" + attackArea.x + "," + attackArea.y + ") [" + (groundPreparingCount + 1) + "/" + MAX_CONCURRENT_GROUND_ATTACKS + "]");
              this.lastAttackAt = currentTick;
            }
            } // end if (attackArea)
          } // end if (groundPreparingCount)
        };

        AttackMissionFactory.prototype.onMissionFailed = function () {};
        return AttackMissionFactory;
      }());
      e("AttackMissionFactory", AttackMissionFactory);
    },
  };
});
