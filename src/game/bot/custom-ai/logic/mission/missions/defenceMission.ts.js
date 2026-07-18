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

      var DefenceMissionFactory = /** @class */ (function () {
        function DefenceMissionFactory() { this.lastDefenceCheckAt = 0; }
        DefenceMissionFactory.prototype.getName = function () { return "DefenceMissionFactory"; };
        DefenceMissionFactory.prototype.maybeCreateMissions = function (gameApi, playerData, matchAwareness, missionController, logger) {
          if (gameApi.getCurrentTick() < this.lastDefenceCheckAt + DEFENCE_CHECK_TICKS) return;
          this.lastDefenceCheckAt = gameApi.getCurrentTick();
          var defendableRadius = DEFENCE_STARTING_RADIUS + DEFENCE_RADIUS_INCREASE_PER_GAME_TICK * gameApi.getCurrentTick();
          var enemiesNearSpawn = matchAwareness
            .getHostilesNearPoint2d(playerData.startLocation, defendableRadius)
            .map(function (unit) { return gameApi.getUnitData(unit.unitId); })
            .filter(function (unit) { return !isOwnedByNeutral(unit); });
          if (enemiesNearSpawn.length > 0) {
            logger("Starting defence mission, " + enemiesNearSpawn.length + " found in radius " + defendableRadius + " (tick " + gameApi.getCurrentTick() + ")");
            missionController.addMission(new DefenceMission("globalDefence", 10, matchAwareness.getMainRallyPoint(), playerData.startLocation, defendableRadius * 1.2, logger));
          }
        };
        DefenceMissionFactory.prototype.onMissionFailed = function () {};
        return DefenceMissionFactory;
      }());
      e("DefenceMissionFactory", DefenceMissionFactory);
    },
  };
});
