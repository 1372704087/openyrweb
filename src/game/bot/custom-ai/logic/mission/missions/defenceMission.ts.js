// === Custom AI module: game/bot/custom-ai/logic/mission/missions/defenceMission ===
System.register("game/bot/custom-ai/logic/mission/missions/defenceMission", ["game/api/index", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/mission/missionController", "game/bot/custom-ai/logic/mission/mission", "game/bot/custom-ai/logic/mission/missionFactories", "game/bot/custom-ai/logic/mission/missions/squads/combatSquad", "game/bot/custom-ai/logic/common/utils", "game/bot/custom-ai/logic/mission/actionBatcher"], function (e, t) {
  "use strict";
  var ActionsApi, GameApi, PlayerData, SideType, UnitData, Vector2;
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
        SideType = A.SideType;
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

      var MAX_PRIORITY = 70;
      var PRIORITY_INCREASE_PER_TICK_RATIO = 1.025;

      var DefenceMission = /** @class */ (function (Mission) {
        function DefenceMission(uniqueName, priority, rallyArea, defenceArea, radius, logger, preferredUnits, isProactive) {
          if (preferredUnits === void 0) { preferredUnits = null; }
          if (isProactive === void 0) { isProactive = false; }
          Mission.call(this, uniqueName, logger);
          this.priority = priority;
          this.defenceArea = defenceArea;
          this.radius = radius;
          this.preferredUnits = preferredUnits;
          this.isProactive = isProactive;
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
            // 主动防御：没有敌人时，请求坦克单位驻守，不释放
            if (this.isProactive && this.preferredUnits && this.preferredUnits.length > 0) {
              var currentUnits = this.getUnitsGameObjectData(gameApi);
              var currentNames = currentUnits.map(function (u) { return u.name; });
              var missingUnits = this.preferredUnits.filter(function (name) { return currentNames.indexOf(name) === -1; });
              // 如果当前单位数量不足 preferredUnits，请求补充
              if (currentUnits.length < this.preferredUnits.length) {
                this.priority = 10;
                return requestUnits(missingUnits.length > 0 ? missingUnits : this.preferredUnits, this.priority);
              }
              return noop();
            }
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

      var DEFENCE_CHECK_TICKS = 15;
      var DEFENCE_STARTING_RADIUS = 10;
      var DEFENCE_RADIUS_INCREASE_PER_GAME_TICK = 0.001;
      // 多区域防御：最少保留 2 支防守部队防偷家，最多 5 个区域
      var MIN_DEFENCE_ZONES = 2;
      var MAX_DEFENCE_ZONES = 5;
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

          // 保底防御：如果当前防御任务不足 MIN_DEFENCE_ZONES，即使没有敌人也创建驻守任务
          if (existingDefenceMissions.length < MIN_DEFENCE_ZONES) {
            // 根据阵营确定坦克类型
            var tankUnit = "HTNK"; // 默认苏联犀牛坦克
            if (playerData.country) {
              if (playerData.country.side === SideType.GDI) tankUnit = "MTNK"; // 盟军灰熊
              else if (playerData.country.side === SideType.ThirdSide) tankUnit = "LTNK"; // 尤里鞭打者
            }
            // 主动防御编队：2 辆坦克
            var preferredUnits = [tankUnit, tankUnit];
            for (var pi2 = 0; pi2 < defencePoints.length && existingDefenceMissions.length < MIN_DEFENCE_ZONES; pi2++) {
              var dp2 = defencePoints[pi2];
              var alreadyCovered2 = existingDefenceMissions.some(function (m) {
                var defenceArea = m.defenceArea;
                if (!defenceArea) return false;
                var dx = defenceArea.x - dp2.x;
                var dy = defenceArea.y - dp2.y;
                return dx * dx + dy * dy < DEFENCE_ZONE_MIN_DISTANCE * DEFENCE_ZONE_MIN_DISTANCE;
              });
              if (alreadyCovered2) continue;
              var missionName = "defence-" + dp2.label + "-" + gameApi.getCurrentTick();
              logger("[MULTI_DEFENCE] 保底防御任务 " + missionName + " 于(" + dp2.x + "," + dp2.y + ") 驻守坦克=" + tankUnit);
              var added = missionController.addMission(
                new DefenceMission(missionName, 10, matchAwareness.getMainRallyPoint(), new Vector2(dp2.x, dp2.y), defendableRadius * 1.2, logger, preferredUnits, true)
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
