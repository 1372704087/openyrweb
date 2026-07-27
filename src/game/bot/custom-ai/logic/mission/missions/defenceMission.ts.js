// === Custom AI module: game/bot/custom-ai/logic/mission/missions/defenceMission ===
System.register("game/bot/custom-ai/logic/mission/missions/defenceMission", ["game/api/index", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/mission/missionController", "game/bot/custom-ai/logic/mission/mission", "game/bot/custom-ai/logic/mission/missionFactories", "game/bot/custom-ai/logic/mission/missions/squads/combatSquad", "game/bot/custom-ai/logic/common/utils", "game/bot/custom-ai/logic/mission/actionBatcher"], function (e, t) {
  "use strict";
  var ActionsApi, GameApi, PlayerData, UnitData, Vector2;
  var Mission, grabCombatants, noop, releaseUnits, requestUnits;
  var CombatSquad;
  var DebugLogger, isOwnedByNeutral;
  t && t.id;
  return {
    setters: [
      function (A) {
        ActionsApi = A.ActionsApi;
        GameApi = A.GameApi;
        PlayerData = A.PlayerData;
        UnitData = A.UnitData;
        Vector2 = A.Vector2;
      },
      function () {},
      function () {},
      function (D) {
        Mission = D.Mission;
        grabCombatants = D.grabCombatants;
        noop = D.noop;
        releaseUnits = D.releaseUnits;
        requestUnits = D.requestUnits;
      },
      function () {},
      function (F) {
        CombatSquad = F.CombatSquad;
      },
      function (G) {
        DebugLogger = G.DebugLogger;
        isOwnedByNeutral = G.isOwnedByNeutral;
      },
      function () {},
    ],
    execute: function () {

      var MAX_PRIORITY = 100;
      var PRIORITY_INCREASE_PER_TICK_RATIO = 1.025;

      var DefenceMission = /** @class */ (function (Mission) {
        function DefenceMission(uniqueName, priority, rallyArea, defenceArea, radius, logger) {
          Mission.call(this, uniqueName, logger);
          this.priority = priority;
          this.defenceArea = defenceArea;
          this.radius = radius;
          this.squad = new CombatSquad(rallyArea, defenceArea, radius);
        }
        DefenceMission.prototype = Object.create(Mission.prototype);
        DefenceMission.prototype.constructor = DefenceMission;

        DefenceMission.prototype._onAiUpdate = function (gameApi, actionsApi, playerData, matchAwareness, actionBatcher) {
          var foundTargets = matchAwareness
            .getHostilesNearPoint2d(this.defenceArea, this.radius)
            .map(function (unit) { return gameApi.getUnitData(unit.unitId); })
            .filter(function (unit) { return !isOwnedByNeutral(unit); });

          var update = this.squad.onAiUpdate(gameApi, actionsApi, actionBatcher, playerData, this, matchAwareness, this.logger);

          if (update.type !== "noop") return update;

          if (foundTargets.length === 0) {
            this.priority = 0;
            if (this.getUnitIds().length > 0) {
              this.logger("(Defence Mission " + this.getUniqueName() + "): No targets found, releasing units.");
              return releaseUnits(this.getUnitIds());
            } else {
              return noop();
            }
          } else {
            var targetUnit = foundTargets[0];
            this.logger("(Defence Mission " + this.getUniqueName() + "): Focused on target " + (targetUnit ? targetUnit.name : undefined) + " (" + foundTargets.length + " found in area " + this.radius + ")");
            this.squad.setAttackArea(new Vector2(foundTargets[0].tile.rx, foundTargets[0].tile.ry));
            this.priority = MAX_PRIORITY;
            return grabCombatants(playerData.startLocation, this.priority);
          }
        };
        DefenceMission.prototype.getGlobalDebugText = function () { return this.squad.getGlobalDebugText() || "<none>"; };
        DefenceMission.prototype.getPriority = function () { return this.priority; };
        return DefenceMission;
      }(Mission));
      e("DefenceMission", DefenceMission);

      var DEFENCE_CHECK_TICKS = 30;
      var DEFENCE_STARTING_RADIUS = 10;
      var DEFENCE_RADIUS_INCREASE_PER_GAME_TICK = 0.001;
      // 多区域防御：每个防御区域独立形成任务，最多同时 8 个区域
      var MAX_DEFENCE_ZONES = 8;
      // 同一区域内的防御任务去重半径
      var DEFENCE_ZONE_MIN_DISTANCE = 10;

      var DefenceMissionFactory = /** @class */ (function () {
        function DefenceMissionFactory() { this.lastDefenceCheckAt = 0; }
        DefenceMissionFactory.prototype.getName = function () { return "DefenceMissionFactory"; };
        DefenceMissionFactory.prototype.maybeCreateMissions = function (gameApi, playerData, matchAwareness, missionController, logger) {
          if (gameApi.getCurrentTick() < this.lastDefenceCheckAt + DEFENCE_CHECK_TICKS) return;
          this.lastDefenceCheckAt = gameApi.getCurrentTick();
          var defendableRadius = DEFENCE_STARTING_RADIUS + DEFENCE_RADIUS_INCREASE_PER_GAME_TICK * gameApi.getCurrentTick();

          // 收集需要防御的关键位置：起始基地 + 可见的资源建筑
          var defencePoints = [{ x: playerData.startLocation.x, y: playerData.startLocation.y, label: "base" }];
          try {
            var refinaryIds = gameApi.getVisibleUnits(playerData.name, "self", function (r) {
              return r.name === "GAREFN" || r.name === "NAREFN" || r.name === "YAREFN";
            });
            refinaryIds.forEach(function (rid) {
              var unit = gameApi.getUnitData(rid);
              if (unit && unit.tile) {
                defencePoints.push({ x: unit.tile.rx, y: unit.tile.ry, label: "refinery" });
              }
            });
          } catch (_) {}

          // 统计当前已有的防御任务
          var existingDefenceMissions = missionController.getMissions().filter(function (m) {
            return m.getUniqueName().indexOf("defence-") === 0;
          });
          if (existingDefenceMissions.length >= MAX_DEFENCE_ZONES) return;

          // 对每个防御点检查附近是否有敌人
          for (var pi = 0; pi < defencePoints.length; pi++) {
            if (existingDefenceMissions.length >= MAX_DEFENCE_ZONES) break;
            var dp = defencePoints[pi];

            // 检查是否已有防御任务覆盖此区域
            var alreadyCovered = existingDefenceMissions.some(function (m) {
              var defenceArea = m.defenceArea;
              if (!defenceArea) return false;
              var dx = defenceArea.x - dp.x;
              var dy = defenceArea.y - dp.y;
              return dx * dx + dy * dy < DEFENCE_ZONE_MIN_DISTANCE * DEFENCE_ZONE_MIN_DISTANCE;
            });
            if (alreadyCovered) continue;

            var enemiesNear = matchAwareness
              .getHostilesNearPoint2d(new Vector2(dp.x, dp.y), defendableRadius)
              .map(function (unit) { return gameApi.getUnitData(unit.unitId); })
              .filter(function (unit) { return !isOwnedByNeutral(unit); });

            if (enemiesNear.length > 0) {
              var missionName = "defence-" + dp.label + "-" + gameApi.getCurrentTick();
              logger("[MULTI_DEFENCE] 启动区域防御任务 " + missionName + " 于(" + dp.x + "," + dp.y + ") 发现 " + enemiesNear.length + " 敌人");
              var added = missionController.addMission(
                new DefenceMission(missionName, 10, matchAwareness.getMainRallyPoint(), new Vector2(dp.x, dp.y), defendableRadius * 1.2, logger)
              );
              if (added) {
                existingDefenceMissions.push(added);
              }
            }
          }
        };
        DefenceMissionFactory.prototype.onMissionFailed = function () {};
        return DefenceMissionFactory;
      }());
      e("DefenceMissionFactory", DefenceMissionFactory);
    },
  };
});
