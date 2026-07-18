// === Custom AI module: game/bot/custom-ai/logic/mission/mission ===
System.register("game/bot/custom-ai/logic/mission/mission", ["game/api/index", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/common/utils", "game/bot/custom-ai/logic/mission/actionBatcher", "game/bot/custom-ai/logic/map/map", "game/bot/custom-ai/logic/common/rulesCache"], function (e, t) {
  "use strict";
  var ActionsApi, GameApi, GameObjectData, PlayerData, TechnoRules, Tile, UnitData, Vector2;
  var DebugLogger;
  var getDistanceBetweenTileAndPoint;
  var getCachedTechnoRules;
  t && t.id;
  return {
    setters: [
      function (A) {
        ActionsApi = A.ActionsApi;
        GameApi = A.GameApi;
        GameObjectData = A.GameObjectData;
        PlayerData = A.PlayerData;
        TechnoRules = A.TechnoRules;
        Tile = A.Tile;
        UnitData = A.UnitData;
        Vector2 = A.Vector2;
      },
      function () {},
      function (C) {
        DebugLogger = C.DebugLogger;
      },
      function () {},
      function (E) {
        getDistanceBetweenTileAndPoint = E.getDistanceBetweenTileAndPoint;
      },
      function (F) {
        getCachedTechnoRules = F.getCachedTechnoRules;
      },
    ],
    execute: function () {

      var calculateCenterOfMass = function (unitTiles) {
        if (unitTiles.length === 0) {
          return null;
        }
        var sums = unitTiles.reduce(
          function (acc, tile) {
            return {
              x: acc.x + (tile.rx || 0),
              y: acc.y + (tile.ry || 0),
            };
          },
          { x: 0, y: 0 },
        );
        var centerOfMass = new Vector2(Math.round(sums.x / unitTiles.length), Math.round(sums.y / unitTiles.length));
        var distances = unitTiles.map(function (tile) { return getDistanceBetweenTileAndPoint(tile, centerOfMass); });
        var maxDistance = Math.max.apply(Math, distances);
        return { centerOfMass: centerOfMass, maxDistance: maxDistance };
      };

      // AI starts Missions based on heuristics.
      var Mission = /** @class */ (function () {
        function Mission(uniqueName, logger) {
          this.uniqueName = uniqueName;
          this.logger = logger;
          this.active = true;
          this.unitIds = [];
          this.centerOfMass = null;
          this.maxDistanceToCenterOfMass = null;
          this.onFinish = function () {};
        }
        Mission.prototype.updateCenterOfMass = function (gameApi) {
          var unitTiles = this.unitIds
            .map(function (unitId) { return gameApi.getGameObjectData(unitId); })
            .map(function (unit) { return unit ? unit.tile : undefined; })
            .filter(function (tile) { return !!tile; });
          var tileMetrics = calculateCenterOfMass(unitTiles);
          if (tileMetrics) {
            this.centerOfMass = tileMetrics.centerOfMass;
            this.maxDistanceToCenterOfMass = tileMetrics.maxDistance;
          } else {
            this.centerOfMass = null;
            this.maxDistanceToCenterOfMass = null;
          }
        };
        Mission.prototype.onAiUpdate = function (gameApi, actionsApi, playerData, matchAwareness, actionBatcher) {
          this.updateCenterOfMass(gameApi);
          return this._onAiUpdate(gameApi, actionsApi, playerData, matchAwareness, actionBatcher);
        };
        Mission.prototype.isActive = function () {
          return this.active;
        };
        Mission.prototype.getUnitIds = function () {
          return this.unitIds;
        };
        Mission.prototype.removeUnit = function (unitIdToRemove) {
          this.unitIds = this.unitIds.filter(function (unitId) { return unitId != unitIdToRemove; });
        };
        Mission.prototype.addUnit = function (unitIdToAdd) {
          this.unitIds.push(unitIdToAdd);
        };
        Mission.prototype.getUnits = function (gameApi) {
          return this.unitIds
            .map(function (unitId) { return gameApi.getUnitData(unitId); })
            .filter(function (unit) { return unit != null; });
        };
        Mission.prototype.getUnitsGameObjectData = function (gameApi) {
          return this.unitIds
            .map(function (unitId) { return gameApi.getGameObjectData(unitId); })
            .filter(function (unit) { return unit != null; });
        };
        Mission.prototype.getUnitsOfTypes = function (gameApi) {
          var names = [];
          for (var _i = 1; _i < arguments.length; _i++) {
            names[_i - 1] = arguments[_i];
          }
          return this.unitIds
            .map(function (unitId) { return gameApi.getUnitData(unitId); })
            .filter(function (unit) { return !!unit && names.indexOf(unit.name) !== -1; });
        };
        Mission.prototype.getUnitsMatchingByRule = function (gameApi, filter) {
          return this.unitIds
            .map(function (unitId) {
              return { unitId: unitId, rules: getCachedTechnoRules(gameApi, unitId) };
            })
            .filter(function (entry) { return entry.rules !== null; })
            .filter(function (entry) { return filter(entry.rules); })
            .map(function (entry) { return entry.unitId; });
        };
        Mission.prototype.getCenterOfMass = function () {
          return this.centerOfMass;
        };
        Mission.prototype.getMaxDistanceToCenterOfMass = function () {
          return this.maxDistanceToCenterOfMass;
        };
        Mission.prototype.getUniqueName = function () {
          return this.uniqueName;
        };
        Mission.prototype.endMission = function (reason) {
          this.onFinish(this.unitIds, reason);
          this.active = false;
        };
        Mission.prototype.then = function (onFinish) {
          this.onFinish = onFinish;
          return this;
        };
        Mission.prototype.isUnitsLocked = function () {
          return true;
        };
        return Mission;
      }());
      e("Mission", Mission);

      var noop = function () {
        return { type: "noop" };
      };
      e("noop", noop);

      var disbandMission = function (reason) { return ({ type: "disband", reason: reason }); };
      e("disbandMission", disbandMission);

      var isDisbandMission = function (a) {
        return a.action.type === "disband";
      };
      e("isDisbandMission", isDisbandMission);

      var requestUnits = function (unitNames, priority) {
        return ({ type: "request", unitNames: unitNames, priority: priority });
      };
      e("requestUnits", requestUnits);

      var isRequestUnits = function (a) {
        return a.action.type === "request";
      };
      e("isRequestUnits", isRequestUnits);

      var requestSpecificUnits = function (unitIds, priority) {
        return ({ type: "requestSpecific", unitIds: unitIds, priority: priority });
      };
      e("requestSpecificUnits", requestSpecificUnits);

      var isRequestSpecificUnits = function (a) {
        return a.action.type === "requestSpecific";
      };
      e("isRequestSpecificUnits", isRequestSpecificUnits);

      var grabCombatants = function (point, radius) {
        return ({ type: "requestCombatants", point: point, radius: radius });
      };
      e("grabCombatants", grabCombatants);

      var isGrabCombatants = function (a) {
        return a.action.type === "requestCombatants";
      };
      e("isGrabCombatants", isGrabCombatants);

      var releaseUnits = function (unitIds) { return ({ type: "releaseUnits", unitIds: unitIds }); };
      e("releaseUnits", releaseUnits);

      var isReleaseUnits = function (a) {
        return a.action.type === "releaseUnits";
      };
      e("isReleaseUnits", isReleaseUnits);
    },
  };
});
