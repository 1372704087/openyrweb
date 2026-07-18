// === Custom AI module: game/bot/custom-ai/logic/building/queueController ===
System.register("game/bot/custom-ai/logic/building/queueController", [
  "game/api/index",
  "game/bot/custom-ai/logic/threat/threat",
  "game/bot/custom-ai/logic/building/buildingRules",
  "game/bot/custom-ai/logic/common/utils"
], function (e, t) {
  "use strict";
  var A, T, B, U;
  t && t.id;
  return {
    setters: [
      function (x) { A = x; },
      function (x) { T = x; },
      function (x) { B = x; },
      function (x) { U = x; },
    ],
    execute: function () {
      var TechnoRulesWithPriority = B.TechnoRulesWithPriority;
      var QUEUES = [
        A.QueueType.Structures,
        A.QueueType.Armory,
        A.QueueType.Infantry,
        A.QueueType.Vehicles,
        A.QueueType.Aircrafts,
        A.QueueType.Ships
      ];
      var queueTypeToName = function (queue) {
        switch (queue) {
          case A.QueueType.Structures: return "Structures";
          case A.QueueType.Armory: return "Armory";
          case A.QueueType.Infantry: return "Infantry";
          case A.QueueType.Vehicles: return "Vehicles";
          case A.QueueType.Aircrafts: return "Aircrafts";
          case A.QueueType.Ships: return "Ships";
          default: return "Unknown";
        }
      };
      var REPAIR_CHECK_INTERVAL = 30;
      var MIN_CREDITS_FOR_OFFENSE = 5000;
      var OFFENSIVE_QUEUES = [A.QueueType.Infantry, A.QueueType.Vehicles, A.QueueType.Aircrafts, A.QueueType.Ships];
      var MAX_PLACEMENT_FAILURES = 3;
      var PLACEMENT_RETRY_INTERVAL_TICKS = 15;
      var QueueController = class {
        constructor() {
          this.queueStates = [];
          this.lastRepairCheckAt = 0;
          this.placementFailures = {};
        }
        onAiUpdate(game, productionApi, actionsApi, playerData, threatCache, unitTypeRequests, logger) {
          this.queueStates = QUEUES.map(function (queueType) {
            var options = productionApi.getAvailableObjects(queueType);
            if (queueType === A.QueueType.Structures) {
              logger("Available structures: " + options.map(function (o) { return o.name; }).join(", "));
            }
            var items = this.getPrioritiesForBuildingOptions(game, options, threatCache, playerData, unitTypeRequests, logger);
            var topItem = items.length > 0 ? items[items.length - 1] : undefined;
            if (topItem && topItem.priority > 0 && playerData.credits < MIN_CREDITS_FOR_OFFENSE && OFFENSIVE_QUEUES.indexOf(queueType) !== -1) {
              topItem = { unit: topItem.unit, priority: topItem.priority * (playerData.credits / MIN_CREDITS_FOR_OFFENSE) };
            }
            return {
              queue: queueType,
              items: items,
              topItem: topItem && topItem.priority > 0 ? topItem : undefined
            };
          }, this);
          var totalWeightAcrossQueues = this.queueStates
            .map(function (decision) { return decision.topItem ? decision.topItem.priority : 0; })
            .reduce(function (pV, cV) { return pV + cV; }, 0);
          var totalCostAcrossQueues = this.queueStates
            .map(function (decision) { return decision.topItem ? decision.topItem.unit.cost : 0; })
            .reduce(function (pV, cV) { return pV + cV; }, 0);
          this.queueStates.forEach(function (decision) {
            this.updateBuildQueue(game, productionApi, actionsApi, playerData, threatCache, decision.queue, decision.topItem, totalWeightAcrossQueues, totalCostAcrossQueues, logger);
          }, this);
          if (playerData.credits > 0 && game.getCurrentTick() > this.lastRepairCheckAt + REPAIR_CHECK_INTERVAL) {
            game.getVisibleUnits(playerData.name, "self", function (r) { return r.repairable; }).forEach(function (unitId) {
              var unit = game.getUnitData(unitId);
              if (!unit || !unit.hitPoints || !unit.maxHitPoints || unit.hasWrenchRepair) {
                return;
              }
              if (unit.hitPoints < unit.maxHitPoints) {
                actionsApi.toggleRepairWrench(unitId);
              }
            });
            this.lastRepairCheckAt = game.getCurrentTick();
          }
        }
        updateBuildQueue(game, productionApi, actionsApi, playerData, threatCache, queueType, decision, totalWeightAcrossQueues, totalCostAcrossQueues, logger) {
          var myCredits = playerData.credits;
          var queueData = productionApi.getQueueData(queueType);
          if (queueData.status == A.QueueStatus.Idle) {
            if (decision !== undefined) {
              logger("Decision (" + queueTypeToName(queueType) + "): " + decision.unit.name);
              actionsApi.queueForProduction(queueType, decision.unit.name, decision.unit.type, 1);
            }
          } else if (queueData.status == A.QueueStatus.Ready && queueData.items.length > 0) {
            var objectReady = queueData.items[0].rules;
            if (queueType == A.QueueType.Structures || queueType == A.QueueType.Armory) {
              var refCount = this.placementFailures[objectReady.name] || 0;
              if (refCount >= MAX_PLACEMENT_FAILURES) {
                logger("Giving up on " + objectReady.name + " after " + refCount + " placement failures, cancelling.");
                actionsApi.unqueueFromProduction(queueData.type, objectReady.name, objectReady.type, 1);
                delete this.placementFailures[objectReady.name];
                return;
              }
              var lastAttempt = this.placementFailures[objectReady.name + "_lastTick"] || 0;
              if (refCount > 0 && game.getCurrentTick() < lastAttempt + PLACEMENT_RETRY_INTERVAL_TICKS) {
                return;
              }
              var location = this.getBestLocationForStructure(game, playerData, objectReady);
              if (location !== undefined) {
                logger("Completed: " + queueTypeToName(queueType) + ": " + objectReady.name + ", placing at " + location.rx + "," + location.ry);
                actionsApi.placeBuilding(objectReady.name, location.rx, location.ry);
                delete this.placementFailures[objectReady.name];
                delete this.placementFailures[objectReady.name + "_lastTick"];
              } else {
                this.placementFailures[objectReady.name] = refCount + 1;
                this.placementFailures[objectReady.name + "_lastTick"] = game.getCurrentTick();
                logger("Completed: " + queueTypeToName(queueType) + ": " + objectReady.name + " but nowhere to place it (failure " + (refCount + 1) + "/" + MAX_PLACEMENT_FAILURES + ")");
              }
            }
          } else if (queueData.status == A.QueueStatus.Active && queueData.items.length > 0 && decision != null) {
            var currentProduction = queueData.items[0].rules;
            if (decision.unit != currentProduction) {
              var currentItemPriority = this.getPriorityForBuildingOption(currentProduction, game, playerData, threatCache);
              var newItemPriority = decision.priority;
              if (newItemPriority > currentItemPriority * 2) {
                logger("Dequeueing queue " + queueTypeToName(queueData.type) + " unit " + currentProduction.name + " because " + decision.unit.name + " has 2x higher priority.");
                actionsApi.unqueueFromProduction(queueData.type, currentProduction.name, currentProduction.type, 1);
              }
            } else {
              if (totalCostAcrossQueues > myCredits && decision.priority < totalWeightAcrossQueues * 0.25) {
                logger("Pausing queue " + queueTypeToName(queueData.type) + " because weight is low (" + decision.priority + "/" + totalWeightAcrossQueues + ")");
                actionsApi.pauseProduction(queueData.type);
              }
            }
          } else if (queueData.status == A.QueueStatus.OnHold) {
            if (myCredits >= totalCostAcrossQueues) {
              logger("Resuming queue " + queueTypeToName(queueData.type) + " because credits are high");
              actionsApi.resumeProduction(queueData.type);
            } else if (decision && decision.priority >= totalWeightAcrossQueues * 0.25) {
              logger("Resuming queue " + queueTypeToName(queueData.type) + " because weight is high (" + decision.priority + "/" + totalWeightAcrossQueues + ")");
              actionsApi.resumeProduction(queueData.type);
            }
          }
        }
        getPrioritiesForBuildingOptions(game, options, threatCache, playerData, unitTypeRequests, logger) {
          var priorityQueue = [];
          options.forEach(function (option) {
            var calculatedPriority = this.getPriorityForBuildingOption(option, game, playerData, threatCache);
            var actualPriority = Math.max(calculatedPriority, unitTypeRequests.get(option.name) !== undefined ? unitTypeRequests.get(option.name) : calculatedPriority);
            if (actualPriority > 0) {
              priorityQueue.push({ unit: option, priority: actualPriority });
            }
          }, this);
          priorityQueue = priorityQueue.sort(function (a, b) { return a.priority - b.priority; });
          return priorityQueue;
        }
        getPriorityForBuildingOption(option, game, playerStatus, threatCache) {
          if (B.BUILDING_NAME_TO_RULES.has(option.name)) {
            var logic = B.BUILDING_NAME_TO_RULES.get(option.name);
            return logic.getPriority(game, playerStatus, option, threatCache);
          } else {
            return B.DEFAULT_BUILDING_PRIORITY - game.getVisibleUnits(playerStatus.name, "self", function (r) { return r == option; }).length;
          }
        }
        getBestLocationForStructure(game, playerData, objectReady) {
          if (B.BUILDING_NAME_TO_RULES.has(objectReady.name)) {
            var logic = B.BUILDING_NAME_TO_RULES.get(objectReady.name);
            return logic.getPlacementLocation(game, playerData, objectReady);
          } else {
            return B.getDefaultPlacementLocation(game, playerData, playerData.startLocation, objectReady);
          }
        }
        getGlobalDebugText(gameApi, productionApi) {
          var productionState = QUEUES.reduce(function (prev, queueType) {
            if (productionApi.getQueueData(queueType).size === 0) {
              return prev;
            }
            var paused = productionApi.getQueueData(queueType).status === A.QueueStatus.OnHold;
            return prev + " [" + queueTypeToName(queueType) + (paused ? " PAUSED" : "") + ": " +
              productionApi.getQueueData(queueType).items.map(function (item) { return item.rules.name + (item.quantity > 1 ? "x" + item.quantity : ""); }) + "]";
          }, "");
          var queueStates = this.queueStates
            .filter(function (queueState) { return queueState.items.length > 0; })
            .map(function (queueState) {
              var queueString = queueState.items
                .map(function (item) { return item.unit.name + "(" + Math.round(item.priority * 10) / 10 + ")"; })
                .join(", ");
              return queueTypeToName(queueState.queue) + " Prios: " + queueString + "\n";
            })
            .join("");
          return "Production: " + productionState + "\n" + queueStates;
        }
      };
      e("queueTypeToName", queueTypeToName);
      e("QUEUES", QUEUES);
      e("QueueController", QueueController);
    },
  };
});
