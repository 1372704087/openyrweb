// === Custom AI module: game/bot/custom-ai/logic/mission/missions/squads/combatSquad ===
System.register("game/bot/custom-ai/logic/mission/missions/squads/combatSquad", ["game/api/index", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/mission/missions/squads/common", "game/bot/custom-ai/logic/common/utils", "game/bot/custom-ai/logic/mission/actionBatcher", "game/bot/custom-ai/logic/mission/missions/squads/squad", "game/bot/custom-ai/logic/mission/mission"], function (e, t) {
  "use strict";
  var ActionsApi, AttackState, GameApi, GameMath, MovementZone, PlayerData, UnitData, Vector2;
  var getAttackWeight, manageAttackMicro, manageMoveMicro;
  var DebugLogger, isOwnedByNeutral, maxBy, minBy;
  var ActionBatcher, BatchableAction;
  var grabCombatants, noop;
  t && t.id;
  return {
    setters: [
      function (A) {
        ActionsApi = A.ActionsApi;
        AttackState = A.AttackState;
        GameApi = A.GameApi;
        GameMath = A.GameMath;
        MovementZone = A.MovementZone;
        PlayerData = A.PlayerData;
        UnitData = A.UnitData;
        Vector2 = A.Vector2;
      },
      function () {},
      function (C) {
        getAttackWeight = C.getAttackWeight;
        manageAttackMicro = C.manageAttackMicro;
        manageMoveMicro = C.manageMoveMicro;
      },
      function (D) {
        DebugLogger = D.DebugLogger;
        isOwnedByNeutral = D.isOwnedByNeutral;
        maxBy = D.maxBy;
        minBy = D.minBy;
      },
      function (E) {
        ActionBatcher = E.ActionBatcher;
        BatchableAction = E.BatchableAction;
      },
      function () {},
      function (G) {
        grabCombatants = G.grabCombatants;
        noop = G.noop;
      },
    ],
    execute: function () {

      var TARGET_UPDATE_INTERVAL_TICKS = 10;
      var MIN_GATHER_RADIUS = 5;
      var MAX_GATHER_RADIUS = 15;
      var GATHER_RATIO = 10;
      var ATTACK_SCAN_AREA = 15;

      var SquadState = { Gathering: 0, Attacking: 1 };

      var CombatSquad = /** @class */ (function () {
        function CombatSquad(rallyArea, targetArea, radius) {
          this.rallyArea = rallyArea;
          this.targetArea = targetArea;
          this.radius = radius;
          this.lastCommand = null;
          this.state = SquadState.Gathering;
          this.debugLastTarget = undefined;
          this.lastOrderGiven = {};
        }
        CombatSquad.prototype.getGlobalDebugText = function () { return this.debugLastTarget || "<none>"; };
        CombatSquad.prototype.setAttackArea = function (targetArea) { this.targetArea = targetArea; };

        CombatSquad.prototype.onAiUpdate = function (gameApi, actionsApi, actionBatcher, playerData, mission, matchAwareness, logger) {
          var _this = this;
          if (mission.getUnitIds().length > 0 && (!this.lastCommand || gameApi.getCurrentTick() > this.lastCommand + TARGET_UPDATE_INTERVAL_TICKS)) {
            this.lastCommand = gameApi.getCurrentTick();
            var centerOfMass = mission.getCenterOfMass();
            var maxDistance = mission.getMaxDistanceToCenterOfMass();
            var unitIds = mission.getUnitsMatchingByRule(gameApi, function (r) { return r.isSelectableCombatant; });
            var units = unitIds.map(function (unitId) { return gameApi.getUnitData(unitId); }).filter(function (unit) { return !!unit; });
            var groundUnitIds = mission.getUnitsMatchingByRule(gameApi, function (r) {
              return r.isSelectableCombatant && (r.movementZone === MovementZone.Infantry || r.movementZone === MovementZone.Normal || r.movementZone === MovementZone.InfantryDestroyer);
            });

            if (this.state === SquadState.Gathering) {
              var requiredGatherRadius = GameMath.sqrt(groundUnitIds.length) * GATHER_RATIO + MIN_GATHER_RADIUS;
              if (centerOfMass && maxDistance && gameApi.mapApi.getTile(centerOfMass.x, centerOfMass.y) !== undefined && maxDistance > requiredGatherRadius) {
                units.forEach(function (unit) { _this.submitActionIfNew(actionBatcher, manageMoveMicro(unit, centerOfMass)); });
              } else {
                logger("CombatSquad " + mission.getUniqueName() + " switching back to attack mode (" + maxDistance + ")");
                this.state = SquadState.Attacking;
              }
            } else {
              var targetPoint = this.targetArea || playerData.startLocation;
              var requiredGatherRadius = GameMath.sqrt(groundUnitIds.length) * GATHER_RATIO + MAX_GATHER_RADIUS;
              if (centerOfMass && maxDistance && gameApi.mapApi.getTile(centerOfMass.x, centerOfMass.y) !== undefined && maxDistance > requiredGatherRadius) {
                logger("CombatSquad " + mission.getUniqueName() + " switching back to gather (" + maxDistance + ")");
                this.state = SquadState.Gathering;
                return noop();
              }
              var getRangeForUnit = function (unit) {
                return unit.primaryWeapon ? unit.primaryWeapon.maxRange : (unit.secondaryWeapon ? unit.secondaryWeapon.maxRange : 5);
              };
              var attackLeader = minBy(units, getRangeForUnit);
              var maxRangeUnit = maxBy(units, getRangeForUnit);
              var dynamicScanRadius = Math.max(ATTACK_SCAN_AREA, maxRangeUnit ? getRangeForUnit(maxRangeUnit) : ATTACK_SCAN_AREA);
              if (!attackLeader) return noop();

              var globalHostilesRaw = matchAwareness
                .getHostilesNearPoint2d(this.targetArea, dynamicScanRadius * 2)
                .map(function (_a) { var unitId = _a.unitId; return gameApi.getUnitData(unitId); })
                .filter(function (unit) { return !!unit && !isOwnedByNeutral(unit); });

              for (var _i = 0, units_1 = units; _i < units_1.length; _i++) {
                var unit = units_1[_i];
                var unitRange = getRangeForUnit(unit);
                var unitScanRadius = Math.max(ATTACK_SCAN_AREA, unitRange);
                var nearbyHostiles = globalHostilesRaw.filter(function (hostile) {
                  var dist = GameMath.sqrt(GameMath.pow(hostile.tile.rx - unit.tile.rx, 2) + GameMath.pow(hostile.tile.ry - unit.tile.ry, 2));
                  return dist <= unitScanRadius;
                });

                var isUnderWaterUnit = ["SUB", "DLPH", "SQD"].indexOf(unit.name) !== -1;

                if (isUnderWaterUnit) {
                  logger("[NAVAL_DEBUG] \u6C34\u4E0B\u5355\u4F4D " + unit.name + "(id:" + unit.id + ") \u5F00\u59CB\u5BFB\u627E\u653B\u51FB\u76EE\u6807 (scan=" + unitScanRadius + ")");
                  logger("[NAVAL_DEBUG]   \u626B\u63CF\u8303\u56F4\u5185\u53D1\u73B0 " + nearbyHostiles.length + " \u4E2A\u654C\u5BF9\u76EE\u6807");
                  nearbyHostiles.forEach(function (hostile, index) {
                    var weight = getAttackWeight(unit, hostile);
                    var isNavalTarget = ["DEST", "AEGIS", "CARRIER", "SUB", "HYD", "DRED", "DLPH", "SQD"].indexOf(hostile.name) !== -1;
                    logger("[NAVAL_DEBUG]     \u76EE\u6807" + (index + 1) + ": " + hostile.name + "(id:" + hostile.id + ") \u6743\u91CD=" + weight + " \u662F\u5426\u6D77\u519B=" + isNavalTarget);
                  });
                }

                var bestUnit = maxBy(nearbyHostiles, function (target) { return getAttackWeight(unit, target); });
                if (bestUnit) {
                  if (isUnderWaterUnit) logger("[NAVAL_DEBUG]   \u9009\u62E9\u653B\u51FB\u76EE\u6807: " + bestUnit.name + "(id:" + bestUnit.id + ")");
                  _this.submitActionIfNew(actionBatcher, manageAttackMicro(unit, bestUnit));
                  _this.debugLastTarget = "Unit " + bestUnit.id.toString();
                } else {
                  if (isUnderWaterUnit) logger("[NAVAL_DEBUG]   \u6CA1\u6709\u627E\u5230\u5408\u9002\u7684\u653B\u51FB\u76EE\u6807\uFF0C\u79FB\u52A8\u5230\u76EE\u6807\u70B9");
                  _this.submitActionIfNew(actionBatcher, manageMoveMicro(unit, targetPoint));
                  _this.debugLastTarget = "@" + targetPoint.x + "," + targetPoint.y;
                }
              }
            }
          }
          return noop();
        };

        CombatSquad.prototype.submitActionIfNew = function (actionBatcher, action) {
          var lastAction = this.lastOrderGiven[action.unitId];
          if (!lastAction || !lastAction.isSameAs(action)) {
            actionBatcher.push(action);
            this.lastOrderGiven[action.unitId] = action;
          }
        };
        return CombatSquad;
      }());
      e("CombatSquad", CombatSquad);
    },
  };
});
