// === Custom AI module: game/bot/custom-ai/logic/mission/missionController ===
System.register("game/bot/custom-ai/logic/mission/missionController", ["game/api/index", "game/bot/custom-ai/logic/mission/mission", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/mission/missionFactories", "game/bot/custom-ai/logic/mission/actionBatcher", "game/bot/custom-ai/logic/common/utils", "game/bot/custom-ai/logic/mission/missions/squads/squad"], function (e, t) {
  "use strict";
  var ActionsApi, GameApi, GameObjectData, ObjectType, PlayerData, UnitData, Vector2;
  var Mission, MissionAction, MissionActionDisband, MissionActionGrabFreeCombatants, MissionActionReleaseUnits, MissionActionRequestSpecificUnits, MissionActionRequestUnits, MissionWithAction, isDisbandMission, isGrabCombatants, isReleaseUnits, isRequestSpecificUnits, isRequestUnits;
  var MissionFactory, createMissionFactories;
  var ActionBatcher;
  var countBy, isSelectableCombatant;
  t && t.id;
  return {
    setters: [
      function (A) {
        ActionsApi = A.ActionsApi;
        GameApi = A.GameApi;
        GameObjectData = A.GameObjectData;
        ObjectType = A.ObjectType;
        PlayerData = A.PlayerData;
        UnitData = A.UnitData;
        Vector2 = A.Vector2;
      },
      function (B) {
        Mission = B.Mission;
        MissionAction = B.MissionAction;
        MissionActionDisband = B.MissionActionDisband;
        MissionActionGrabFreeCombatants = B.MissionActionGrabFreeCombatants;
        MissionActionReleaseUnits = B.MissionActionReleaseUnits;
        MissionActionRequestSpecificUnits = B.MissionActionRequestSpecificUnits;
        MissionActionRequestUnits = B.MissionActionRequestUnits;
        MissionWithAction = B.MissionWithAction;
        isDisbandMission = B.isDisbandMission;
        isGrabCombatants = B.isGrabCombatants;
        isReleaseUnits = B.isReleaseUnits;
        isRequestSpecificUnits = B.isRequestSpecificUnits;
        isRequestUnits = B.isRequestUnits;
      },
      function () {},
      function (D) {
        MissionFactory = D.MissionFactory;
        createMissionFactories = D.createMissionFactories;
      },
      function (E) {
        ActionBatcher = E.ActionBatcher;
      },
      function (F) {
        countBy = F.countBy;
        isSelectableCombatant = F.isSelectableCombatant;
      },
      function () {},
    ],
    execute: function () {

      var MISSING_UNIT_TYPE_REQUEST_DECAY_MULT_RATE = 0.75;
      var MISSING_UNIT_TYPE_REQUEST_DECAY_FLAT_RATE = 1;

      var MissionController = /** @class */ (function () {
        function MissionController(logger) {
          this.logger = logger;
          this.missions = [];
          this.unitIdToMission = new Map();
          this.requestedUnitTypes = new Map();
          this.forceDisbandedMissions = [];
          this.missionFactories = createMissionFactories();
        }
        MissionController.prototype.updateUnitIds = function (gameApi) {
          var _this = this;
          this.unitIdToMission = new Map();
          this.missions.forEach(function (mission) {
            var toRemove = [];
            mission.getUnitIds().forEach(function (unitId) {
              if (_this.unitIdToMission.has(unitId)) {
                _this.logger("WARNING: unit " + unitId + " is in multiple missions, please debug.");
              } else if (!gameApi.getGameObjectData(unitId)) {
                toRemove.push(unitId);
              } else {
                _this.unitIdToMission.set(unitId, mission);
              }
            });
            toRemove.forEach(function (unitId) { return mission.removeUnit(unitId); });
          });
        };
        MissionController.prototype.onAiUpdate = function (gameApi, actionsApi, playerData, matchAwareness) {
          var _this = this;
          this.missions = this.missions.filter(function (missions) { return missions.isActive(); });
          this.updateUnitIds(gameApi);
          var actionBatcher = new ActionBatcher();
          var missionActions = this.missions.map(function (mission) { return ({
            mission: mission,
            action: mission.onAiUpdate(gameApi, actionsApi, playerData, matchAwareness, actionBatcher),
          }); });
          var disbandedMissions = new Map();
          var disbandedMissionsArray = [];
          this.forceDisbandedMissions.forEach(function (name) { return disbandedMissions.set(name, null); });
          this.forceDisbandedMissions = [];
          missionActions.filter(isDisbandMission).forEach(function (a) {
            _this.logger("Mission " + a.mission.getUniqueName() + " disbanding as requested.");
            a.mission.getUnitIds().forEach(function (unitId) {
              _this.unitIdToMission.delete(unitId);
              actionsApi.setUnitDebugText(unitId, undefined);
            });
            disbandedMissions.set(a.mission.getUniqueName(), a.action.reason);
          });
          missionActions.filter(isReleaseUnits).forEach(function (a) {
            a.action.unitIds.forEach(function (unitId) {
              if ((_this.unitIdToMission.get(unitId) || {}).getUniqueName() === a.mission.getUniqueName()) {
                _this.removeUnitFromMission(a.mission, unitId, actionsApi);
              }
            });
          });
          var unitIdToHighestRequest = missionActions.filter(isRequestSpecificUnits).reduce(
            function (prev, missionWithAction) {
              var unitIds = missionWithAction.action.unitIds;
              unitIds.forEach(function (unitId) {
                if (prev.hasOwnProperty(unitId)) {
                  if (prev[unitId].action.priority > prev[unitId].action.priority) {
                    prev[unitId] = missionWithAction;
                  }
                } else {
                  prev[unitId] = missionWithAction;
                }
              });
              return prev;
            },
            {},
          );
          var newMissionAssignments = Object.entries(unitIdToHighestRequest)
            .flatMap(function (_a) {
              var id = _a[0], request = _a[1];
              var unitId = Number.parseInt(id);
              var unit = gameApi.getGameObjectData(unitId);
              var requestingMission = request.mission;
              var missionName = requestingMission.getUniqueName();
              if (!unit) {
                _this.logger("mission " + missionName + " requested non-existent unit " + unitId);
                return [];
              }
              if (!_this.unitIdToMission.has(unitId)) {
                _this.addUnitToMission(requestingMission, unit, actionsApi);
                return [{ unitName: unit.name, mission: requestingMission.getUniqueName() }];
              }
              return [];
            })
            .reduce(
              function (acc, curr) {
                if (!acc[curr.mission]) acc[curr.mission] = {};
                if (!acc[curr.mission][curr.unitName]) acc[curr.mission][curr.unitName] = 0;
                acc[curr.mission][curr.unitName] = acc[curr.mission][curr.unitName] + 1;
                return acc;
              },
              {},
            );
          Object.entries(newMissionAssignments).forEach(function (_a) {
            var mission = _a[0], assignments = _a[1];
            _this.logger(
              "Mission " + mission + " received: " + Object.entries(assignments)
                .map(function (_b) {
                  var unitType = _b[0], count = _b[1];
                  return unitType + " x " + count;
                })
                .join(", "),
            );
          });
          var unitTypeToHighestRequest = missionActions.filter(isRequestUnits).reduce(
            function (prev, missionWithAction) {
              var unitNames = missionWithAction.action.unitNames;
              unitNames.forEach(function (unitName) {
                if (prev.hasOwnProperty(unitName)) {
                  if (prev[unitName].action.priority > prev[unitName].action.priority) {
                    prev[unitName] = missionWithAction;
                  }
                } else {
                  prev[unitName] = missionWithAction;
                }
              });
              return prev;
            },
            {},
          );
          var grabRequests = missionActions.filter(isGrabCombatants);
          var unitIds = gameApi.getVisibleUnits(playerData.name, "self");
          var submarines = unitIds
            .map(function (unitId) { return gameApi.getGameObjectData(unitId); })
            .filter(function (unit) { return !!unit; })
            .filter(function (unit) { return unit.name === "SUB"; });
          var dests = unitIds
            .map(function (unitId) { return gameApi.getGameObjectData(unitId); })
            .filter(function (unit) { return !!unit; })
            .filter(function (unit) { return unit.name === "DEST"; });
          if (dests.length > 2) {
            _this.logger("[NAVAL_DEBUG] \u53EF\u89C1\u5355\u4F4D\u4E2D\u5B58\u5728\u9A71\u9010\u8230: " + dests.length);
          }
          if (submarines.length > 2) {
            _this.logger("[NAVAL_DEBUG] \u53EF\u89C1\u5355\u4F4D\u4E2D\u5B58\u5728\u6F5C\u8247: " + submarines.length);
          }
          var freeUnits = unitIds
            .map(function (unitId) { return gameApi.getGameObjectData(unitId); })
            .filter(function (unit) { return !!unit; })
            .map(function (unit) { return ({
              unit: unit,
              mission: _this.unitIdToMission.get(unit.id),
            }); })
            .filter(function (unitWithMission) { return !unitWithMission.mission || unitWithMission.mission.isUnitsLocked() === false; });
          freeUnits.sort(function (u1, u2) { return (u1.mission ? u1.mission.getPriority() : 0) - (u2.mission ? u2.mission.getPriority() : 0); });
          var newAssignmentsByType = freeUnits
            .flatMap(function (_a) {
              var freeUnit = _a.unit, donatingMission = _a.mission;
              if (unitTypeToHighestRequest.hasOwnProperty(freeUnit.name)) {
                var requestingMission = unitTypeToHighestRequest[freeUnit.name].mission;
                if (donatingMission) {
                  if (donatingMission === requestingMission || donatingMission.getPriority() > requestingMission.getPriority()) {
                    return [];
                  }
                  _this.removeUnitFromMission(donatingMission, freeUnit.id, actionsApi);
                }
                _this.logger("granting unit " + freeUnit.id + "#" + freeUnit.name + " to mission " + requestingMission.getUniqueName());
                _this.addUnitToMission(requestingMission, freeUnit, actionsApi);
                delete unitTypeToHighestRequest[freeUnit.name];
                return [{ unitName: freeUnit.name, missionName: requestingMission.getUniqueName(), method: "type" }];
              } else if (grabRequests.length > 0) {
                var grantedMission = grabRequests.find(function (request) {
                  var canGrabUnit = isSelectableCombatant(freeUnit);
                  return canGrabUnit && request.action.point.distanceTo(new Vector2(freeUnit.tile.rx, freeUnit.tile.ry)) <= request.action.radius;
                });
                if (grantedMission) {
                  if (donatingMission) {
                    if (donatingMission === grantedMission.mission || donatingMission.getPriority() > grantedMission.mission.getPriority()) {
                      return [];
                    }
                    _this.removeUnitFromMission(donatingMission, freeUnit.id, actionsApi);
                  }
                  _this.addUnitToMission(grantedMission.mission, freeUnit, actionsApi);
                  return [{ unitName: freeUnit.name, missionName: grantedMission.mission.getUniqueName(), method: "grab" }];
                }
              }
              return [];
            })
            .reduce(
              function (acc, curr) {
                if (!acc[curr.missionName]) acc[curr.missionName] = {};
                if (!acc[curr.missionName][curr.unitName]) acc[curr.missionName][curr.unitName] = { grab: 0, type: 0 };
                acc[curr.missionName][curr.unitName][curr.method] = acc[curr.missionName][curr.unitName][curr.method] + 1;
                return acc;
              },
              {},
            );
          Object.entries(newAssignmentsByType).forEach(function (_a) {
            var mission = _a[0], assignments = _a[1];
            _this.logger(
              "Mission " + mission + " received: " + Object.entries(assignments)
                .flatMap(function (_b) {
                  var unitType = _b[0], methodToCount = _b[1];
                  return Object.entries(methodToCount)
                    .filter(function (_c) { var count = _c[1]; return count > 0; })
                    .map(function (_d) {
                      var method = _d[0], count = _d[1];
                      return unitType + " x " + count + " (by " + method + ")";
                    });
                })
                .join(", "),
            );
          });
          this.updateRequestedUnitTypes(unitTypeToHighestRequest);
          actionBatcher.resolve(actionsApi, gameApi);
          this.missions
            .filter(function (missions) { return disbandedMissions.has(missions.getUniqueName()); })
            .forEach(function (disbandedMission) {
              var reason = disbandedMissions.get(disbandedMission.getUniqueName());
              _this.logger("mission disbanded: " + disbandedMission.getUniqueName() + ", reason: " + reason);
              disbandedMissionsArray.push({ mission: disbandedMission, reason: reason });
              disbandedMission.endMission(disbandedMissions.get(disbandedMission.getUniqueName()));
            });
          this.missions = this.missions.filter(function (missions) { return !disbandedMissions.has(missions.getUniqueName()); });
          this.missionFactories.forEach(function (missionFactory) {
            missionFactory.maybeCreateMissions(gameApi, playerData, matchAwareness, _this, _this.logger);
            disbandedMissionsArray.forEach(function (_a) {
              var reason = _a.reason, mission = _a.mission;
              missionFactory.onMissionFailed(gameApi, playerData, matchAwareness, mission, reason, _this, _this.logger);
            });
          });
        };
        MissionController.prototype.updateRequestedUnitTypes = function (missingUnitTypeToHighestRequest) {
          var _this = this;
          var currentUnitTypes = Array.from(this.requestedUnitTypes.keys());
          for (var _i = 0, currentUnitTypes_1 = currentUnitTypes; _i < currentUnitTypes_1.length; _i++) {
            var unitType = currentUnitTypes_1[_i];
            var newPriority = this.requestedUnitTypes.get(unitType) * MISSING_UNIT_TYPE_REQUEST_DECAY_MULT_RATE - MISSING_UNIT_TYPE_REQUEST_DECAY_FLAT_RATE;
            if (newPriority > 0.5) {
              this.requestedUnitTypes.set(unitType, newPriority);
            } else {
              this.requestedUnitTypes.delete(unitType);
            }
          }
          Object.entries(missingUnitTypeToHighestRequest).forEach(function (_a) {
            var unitType = _a[0], request = _a[1];
            var currentPriority = _this.requestedUnitTypes.get(unitType);
            _this.requestedUnitTypes.set(unitType, currentPriority ? Math.max(currentPriority, request.action.priority) : request.action.priority);
          });
        };
        MissionController.prototype.getRequestedUnitTypes = function () {
          return this.requestedUnitTypes;
        };
        MissionController.prototype.addUnitToMission = function (mission, unit, actionsApi) {
          mission.addUnit(unit.id);
          this.unitIdToMission.set(unit.id, mission);
          actionsApi.setUnitDebugText(unit.id, mission.getUniqueName() + "_" + unit.id);
        };
        MissionController.prototype.removeUnitFromMission = function (mission, unitId, actionsApi) {
          mission.removeUnit(unitId);
          this.unitIdToMission.delete(unitId);
          actionsApi.setUnitDebugText(unitId, undefined);
        };
        MissionController.prototype.addMission = function (mission) {
          if (this.missions.some(function (m) { return m.getUniqueName() === mission.getUniqueName(); })) {
            return null;
          }
          this.logger("Added mission: " + mission.getUniqueName());
          this.missions.push(mission);
          return mission;
        };
        MissionController.prototype.disbandMission = function (missionName) {
          this.forceDisbandedMissions.push(missionName);
        };
        MissionController.prototype.getGlobalDebugText = function (gameApi) {
          var _this = this;
          var unitsInMission = function (unitIds) { return countBy(unitIds, function (unitId) { var obj = gameApi.getGameObjectData(unitId); return obj ? obj.name : undefined; }); };
          var globalDebugText = "";
          this.missions.forEach(function (mission) {
            _this.logger("Mission " + mission.getUniqueName() + ": " + Object.entries(unitsInMission(mission.getUnitIds()))
              .map(function (_a) {
                var unitName = _a[0], count = _a[1];
                return unitName + " x " + count;
              })
              .join(", "));
            var missionDebugText = mission.getGlobalDebugText();
            if (missionDebugText) {
              globalDebugText += mission.getUniqueName() + ": " + missionDebugText + "\n";
            }
          });
          return globalDebugText;
        };
        MissionController.prototype.updateDebugText = function (actionsApi) {
          this.missions.forEach(function (mission) {
            mission.getUnitIds().forEach(function (unitId) { return actionsApi.setUnitDebugText(unitId, unitId + ": " + mission.getUniqueName()); });
          });
        };
        MissionController.prototype.getMissions = function () {
          return this.missions;
        };
        return MissionController;
      }());
      e("MissionController", MissionController);
    },
  };
});
