// === Custom AI module: game/bot/custom-ai/logic/mission/missions/navalAssaultMission ===
System.register("game/bot/custom-ai/logic/mission/missions/navalAssaultMission", ["game/api/index", "game/bot/custom-ai/logic/mission/mission", "game/bot/custom-ai/logic/mission/missionFactories", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/mission/missionController", "game/bot/custom-ai/logic/common/utils", "game/bot/custom-ai/logic/mission/actionBatcher", "game/bot/custom-ai/logic/composition/sovietNavalCompositions", "game/bot/custom-ai/logic/composition/alliedNavalCompositions", "game/bot/custom-ai/logic/composition/yuriNavalCompositions"], function (e, t) {
  "use strict";
  var ActionsApi, GameApi, ObjectType, OrderType, PlayerData, SideType;
  var Mission, disbandMission, noop, requestUnits;
  var getSovietNavalCompositions;
  var getAlliedNavalCompositions;
  var getYuriNavalCompositions;
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
      function (O) {
        getSovietNavalCompositions = O.getNavalCompositions;
      },
      function (P) {
        getAlliedNavalCompositions = P.getNavalCompositions;
      },
      function (Q) {
        getYuriNavalCompositions = Q.getNavalCompositions;
      },
    ],
    execute: function () {

      var NAVAL_ASSAULT_ATTACK_COOLDOWN_TICKS = 90;
      var NAVAL_ASSAULT_RETARGET_TICKS = 300;
      var NAVAL_ASSAULT_DISBAND_IDLE_TICKS = 600;

      var POWER_PLANT_NAMES = ["GAPOWR", "NAPOWR", "NANRCT", "YAPOWR", "NATBNK"];
      var SHIPYARD_NAMES = ["GAYARD", "NAYARD", "YAYARD"];

      function isShipyard(rules) {
        if (!rules) return false;
        return SHIPYARD_NAMES.indexOf(rules.name) !== -1;
      }

      function isPowerPlant(rules) {
        if (!rules) return false;
        if (rules.power > 0) return true;
        return POWER_PLANT_NAMES.indexOf(rules.name) !== -1;
      }

      function isNavalAssaultTarget(rules) {
        if (!rules) return false;
        if (isShipyard(rules)) return true;
        if (rules.refinery) return true;
        if (rules.weaponsFactory) return true;
        if (rules.constructionYard) return true;
        if (isPowerPlant(rules)) return true;
        return false;
      }

      function getNavalAssaultTargetScore(rules) {
        if (!rules) return 0;
        if (isShipyard(rules)) return 500;
        if (rules.constructionYard) return 450;
        if (rules.refinery) return 400;
        if (isPowerPlant(rules)) return 350;
        if (rules.weaponsFactory) return 300;
        return 100;
      }

      function distanceSq(x1, y1, x2, y2) {
        var dx = x1 - x2;
        var dy = y1 - y2;
        return dx * dx + dy * dy;
      }

      function calculateTargetComposition(gameApi, playerData, matchAwareness) {
        if (!playerData.country) return {};
        if (playerData.country.side === SideType.ThirdSide) {
          return getYuriNavalCompositions(gameApi, playerData, matchAwareness);
        }
        return playerData.country.side === SideType.Nod
          ? getSovietNavalCompositions(gameApi, playerData, matchAwareness)
          : getAlliedNavalCompositions(gameApi, playerData, matchAwareness);
      }

      function getNavalUnitTypes(composition) {
        return Object.keys(composition);
      }

      var NavalAssaultState = { Preparing: 0, Attacking: 1 };

      var NavalAssaultMission = /** @class */ (function (Mission) {
        function NavalAssaultMission(uniqueName, priority, composition, logger) {
          Mission.call(this, uniqueName, logger);
          this.priority = priority;
          this.composition = composition;
          this.state = NavalAssaultState.Preparing;
          this.lastAttackAt = 0;
          this.lastTargetSeenAt = 0;
          this.currentTargetId = null;
        }
        NavalAssaultMission.prototype = Object.create(Mission.prototype);
        NavalAssaultMission.prototype.constructor = NavalAssaultMission;

        NavalAssaultMission.prototype._onAiUpdate = function (gameApi, actionsApi, playerData, matchAwareness, actionBatcher) {
          if (!playerData.country) return disbandMission();

          var navalUnitTypes = getNavalUnitTypes(this.composition);
          if (navalUnitTypes.length === 0) return disbandMission();

          var currentComposition = {};
          var ships = [];
          navalUnitTypes.forEach(function (type) {
            var units = this.getUnitsOfTypes(gameApi, type);
            currentComposition[type] = units.length;
            ships = ships.concat(units);
          }, this);

          if (this.state === NavalAssaultState.Preparing) {
            var missing = navalUnitTypes.filter(function (type) {
              return !currentComposition[type] || currentComposition[type] < this.composition[type];
            }, this);
            if (missing.length > 0) {
              return requestUnits(navalUnitTypes, this.priority);
            }
            this.state = NavalAssaultState.Attacking;
            this.lastTargetSeenAt = gameApi.getCurrentTick();
          }

          if (ships.length === 0) {
            return disbandMission();
          }

          var currentTick = gameApi.getCurrentTick();
          if (currentTick < this.lastAttackAt + NAVAL_ASSAULT_ATTACK_COOLDOWN_TICKS) {
            return noop();
          }

          var targetId = this.pickTarget(gameApi, playerData, matchAwareness);
          if (targetId !== null && targetId !== this.currentTargetId) {
            this.currentTargetId = targetId;
            this.lastTargetSeenAt = currentTick;
          }

          if (this.currentTargetId === null) {
            if (currentTick > this.lastTargetSeenAt + NAVAL_ASSAULT_DISBAND_IDLE_TICKS) {
              return disbandMission();
            }
            if (currentTick > this.lastTargetSeenAt + NAVAL_ASSAULT_RETARGET_TICKS) {
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
            actionsApi.orderUnits(ships.map(function (s) { return s.id; }), OrderType.Attack, this.currentTargetId);
            this.lastAttackAt = currentTick;
            this.lastTargetSeenAt = currentTick;
          }

          return noop();
        };

        NavalAssaultMission.prototype.pickTarget = function (gameApi, playerData, matchAwareness) {
          var rallyPoint = matchAwareness.getMainRallyPoint();
          var enemyUnits = gameApi.getVisibleUnits(playerData.name, "enemy")
            .map(function (unitId) { return gameApi.getGameObjectData(unitId); })
            .filter(function (u) { return !!u && !!u.rules && isNavalAssaultTarget(u.rules); });

          if (enemyUnits.length === 0) return null;

          var scored = enemyUnits.map(function (u) {
            var score = getNavalAssaultTargetScore(u.rules);
            var dist = distanceSq(rallyPoint.x, rallyPoint.y, u.tile.rx, u.tile.ry);
            return { unit: u, score: score, dist: dist };
          }).sort(function (a, b) {
            if (b.score !== a.score) return b.score - a.score;
            return a.dist - b.dist;
          });

          return scored[0].unit.id;
        };

        NavalAssaultMission.prototype.pickFallbackTarget = function (gameApi, playerData, matchAwareness) {
          var enemyBuildings = gameApi.getVisibleUnits(playerData.name, "enemy", function (r) { return r.type === ObjectType.Building; })
            .map(function (unitId) { return gameApi.getGameObjectData(unitId); })
            .filter(function (u) { return !!u && !!u.tile; });
          if (enemyBuildings.length === 0) return null;
          var idx = gameApi.generateRandomInt(0, enemyBuildings.length - 1);
          return enemyBuildings[idx].id;
        };

        NavalAssaultMission.prototype.getGlobalDebugText = function () { return "NavalAssault target=" + this.currentTargetId; };
        NavalAssaultMission.prototype.getPriority = function () { return this.priority; };
        return NavalAssaultMission;
      }(Mission));
      e("NavalAssaultMission", NavalAssaultMission);

      function hasNavalYard(gameApi, playerData) {
        return gameApi.getVisibleUnits(playerData.name, "self", function (r) {
          return r.name === "GAYARD" || r.name === "NAYARD" || r.name === "YAYARD";
        }).length > 0;
      }

      var NAVAL_ASSAULT_CHECK_INTERVAL_TICKS = 1200;
      var NAVAL_ASSAULT_PRIORITY = 70;

      var NavalAssaultMissionFactory = /** @class */ (function () {
        function NavalAssaultMissionFactory() { this.lastCheckAt = 0; }
        NavalAssaultMissionFactory.prototype.getName = function () { return "NavalAssaultMissionFactory"; };
        NavalAssaultMissionFactory.prototype.maybeCreateMissions = function (gameApi, playerData, matchAwareness, missionController, logger) {
          if (!playerData.country) return;
          if (!hasNavalYard(gameApi, playerData)) return;
          if (!(gameApi.getCurrentTick() > this.lastCheckAt + NAVAL_ASSAULT_CHECK_INTERVAL_TICKS)) return;
          this.lastCheckAt = gameApi.getCurrentTick();

          var activeMissions = missionController.getMissions();
          var hasActiveNavalAssault = activeMissions.some(function (m) { return m.getUniqueName().startsWith("naval-assault-"); });
          if (hasActiveNavalAssault) return;

          var composition = calculateTargetComposition(gameApi, playerData, matchAwareness);
          if (Object.keys(composition).length === 0) return;

          var missionName = "naval-assault-" + gameApi.getCurrentTick();
          missionController.addMission(new NavalAssaultMission(missionName, NAVAL_ASSAULT_PRIORITY, composition, logger));
        };
        NavalAssaultMissionFactory.prototype.onMissionFailed = function () {};
        return NavalAssaultMissionFactory;
      }());
      e("NavalAssaultMissionFactory", NavalAssaultMissionFactory);
    },
  };
});
