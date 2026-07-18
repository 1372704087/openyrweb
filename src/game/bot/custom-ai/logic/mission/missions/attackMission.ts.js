// === Custom AI module: game/bot/custom-ai/logic/mission/missions/attackMission ===
System.register("game/bot/custom-ai/logic/mission/missions/attackMission", ["game/api/index", "game/bot/custom-ai/logic/mission/missions/squads/combatSquad", "game/bot/custom-ai/logic/mission/mission", "game/bot/custom-ai/logic/mission/missionFactories", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/mission/missionController", "game/bot/custom-ai/logic/mission/missions/retreatMission", "game/bot/custom-ai/logic/common/utils", "game/bot/custom-ai/logic/mission/actionBatcher", "game/bot/custom-ai/logic/composition/sovietCompositions", "game/bot/custom-ai/logic/composition/alliedCompositions", "game/bot/custom-ai/logic/composition/common", "game/bot/custom-ai/logic/mission/missions/squads/common", "game/bot/custom-ai/logic/map/pathfinding", "game/bot/custom-ai/logic/composition/sovietNavalCompositions",
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
        getYuriComposition = J.getYuriComposition;
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

      var NO_TARGET_RETARGET_TICKS = 450;
      var NO_TARGET_IDLE_TIMEOUT_TICKS = 900;

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

      var ATTACK_MISSION_PRIORITY_RAMP = 1.05;
      var ATTACK_MISSION_MAX_PRIORITY = 50;

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
          this.MAX_LAND_ATTACK_ATTEMPTS = 2;
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

      var getTargetWeight = function (unitData, tryFocusHarvester) {
        if (tryFocusHarvester && unitData.rules.harvester) return 100000;
        else if (unitData.type === ObjectType.Building) return unitData.maxHitPoints * 10;
        else return unitData.maxHitPoints;
      };

      function generateTarget(gameApi, playerData, matchAwareness, includeBaseLocations, logger) {
        if (includeBaseLocations === void 0) { includeBaseLocations = false; }
        var rallyPoint = matchAwareness.getMainRallyPoint();
        try {
          var tryFocusHarvester = gameApi.generateRandomInt(0, 1) === 0;
          var enemyUnits = gameApi.getVisibleUnits(playerData.name, "enemy")
            .map(function (unitId) { return gameApi.getUnitData(unitId); })
            .filter(function (u) { return !!u && gameApi.getPlayerData(u.owner).isCombatant; });

          var computeWeight = function (u) {
            var weight = getTargetWeight(u, tryFocusHarvester);
            try {
              if (!isPointReachable(gameApi, rallyPoint, new Vector2(u.tile.rx, u.tile.ry), SpeedType.Track, 6)) {
                weight *= 0.3;
              }
            } catch (err) { weight *= 0.3; }
            return weight;
          };

          var maxUnit = maxBy(enemyUnits, computeWeight);
          if (maxUnit) {
            if (logger) logger("generateTarget: picked visible enemy unit " + maxUnit.name + " (id=" + maxUnit.id + ") at (" + maxUnit.tile.rx + "," + maxUnit.tile.ry + ")");
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

      var VISIBLE_TARGET_ATTACK_COOLDOWN_TICKS = 120;
      var BASE_ATTACK_COOLDOWN_TICKS = 10;
      var AIR_RAID_PRIORITY = 80;
      var NAVAL_ASSAULT_PRIORITY = 70;

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

      function selectAttackType(gameApi, playerData, matchAwareness) {
        var airAvailable = hasAirProductionForSelector(gameApi, playerData);
        var navalAvailable = hasNavalYardForSelector(gameApi, playerData);
        var roll = gameApi.generateRandomInt(0, 8);
        if (roll < 2 && airAvailable) return "air";
        if (roll < 4 && navalAvailable) return "naval";
        return "ground";
      }

      var AttackMissionFactory = /** @class */ (function () {
        function AttackMissionFactory() { this.lastAttackAt = -VISIBLE_TARGET_ATTACK_COOLDOWN_TICKS; }
        AttackMissionFactory.prototype.getName = function () { return "AttackMissionFactory"; };

        AttackMissionFactory.prototype.maybeCreateMissions = function (gameApi, playerData, matchAwareness, missionController, logger) {
          if (gameApi.getCurrentTick() < this.lastAttackAt + VISIBLE_TARGET_ATTACK_COOLDOWN_TICKS) return;
          if (missionController.getMissions().some(function (mission) { return mission instanceof AttackMission && mission.getState() === AttackMissionState.Preparing; })) return;

          var activeMissions = missionController.getMissions();
          var attackType = selectAttackType(gameApi, playerData, matchAwareness);

          if (attackType === "air") {
            var hasActiveAirRaid = activeMissions.some(function (m) { return m.getUniqueName().startsWith("airraid-"); });
            if (!hasActiveAirRaid) {
              var airMissionName = "airraid-" + gameApi.getCurrentTick();
              var tryAirRaid = missionController.addMission(new AirRaidMission(airMissionName, AIR_RAID_PRIORITY, logger));
              if (tryAirRaid) { this.lastAttackAt = gameApi.getCurrentTick(); }
              return;
            }
          }

          if (attackType === "naval") {
            var hasActiveNavalAssault = activeMissions.some(function (m) { return m.getUniqueName().startsWith("naval-assault-"); });
            if (!hasActiveNavalAssault) {
              var navalComposition = calculateNavalAssaultComposition(gameApi, playerData, matchAwareness);
              if (Object.keys(navalComposition).length > 0) {
                var navalMissionName = "naval-assault-" + gameApi.getCurrentTick();
                var tryNavalAssault = missionController.addMission(new NavalAssaultMission(navalMissionName, NAVAL_ASSAULT_PRIORITY, navalComposition, logger));
                if (tryNavalAssault) { this.lastAttackAt = gameApi.getCurrentTick(); }
                return;
              }
            }
          }

          var attackRadius = 10;
          var includeEnemyBases = gameApi.getCurrentTick() > this.lastAttackAt + BASE_ATTACK_COOLDOWN_TICKS;
          var attackArea = generateTarget(gameApi, playerData, matchAwareness, includeEnemyBases, logger);
          if (!attackArea) return;

          var squadName = "attack_" + gameApi.getCurrentTick();
          var composition = calculateTargetComposition(gameApi, playerData, matchAwareness);

          var tryAttack = missionController.addMission(
            new AttackMission(squadName, 1, matchAwareness.getMainRallyPoint(), attackArea, attackRadius, composition, logger)
              .then(function (unitIds, reason) {
                missionController.addMission(new RetreatMission("retreat-from-" + squadName + gameApi.getCurrentTick(), matchAwareness.getMainRallyPoint(), unitIds, logger));
              }),
          );
          if (tryAttack) { this.lastAttackAt = gameApi.getCurrentTick(); }
        };

        AttackMissionFactory.prototype.onMissionFailed = function () {};
        return AttackMissionFactory;
      }());
      e("AttackMissionFactory", AttackMissionFactory);
    },
  };
});
