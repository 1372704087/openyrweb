// === Custom AI module: game/bot/custom-ai/logic/mission/missions/expansionMission ===
System.register("game/bot/custom-ai/logic/mission/missions/expansionMission", ["game/api/index", "game/bot/custom-ai/logic/mission/mission", "game/bot/custom-ai/logic/mission/missionFactories", "game/bot/custom-ai/logic/awareness", "game/bot/custom-ai/logic/mission/missionController", "game/bot/custom-ai/logic/common/utils", "game/bot/custom-ai/logic/mission/actionBatcher"], function (e, t) {
  "use strict";
  var ActionsApi, GameApi, OrderType, PlayerData, SpeedType, Vector2;
  var Mission, disbandMission, noop, requestSpecificUnits, requestUnits;
  t && t.id;
  return {
    setters: [
      function (A) {
        ActionsApi = A.ActionsApi;
        GameApi = A.GameApi;
        OrderType = A.OrderType;
        PlayerData = A.PlayerData;
        SpeedType = A.SpeedType;
        Vector2 = A.Vector2;
      },
      function (B) {
        Mission = B.Mission;
        disbandMission = B.disbandMission;
        noop = B.noop;
        requestSpecificUnits = B.requestSpecificUnits;
        requestUnits = B.requestUnits;
      },
      function () {},
      function () {},
      function () {},
      function () {},
      function () {},
    ],
    execute: function () {

      var DEPLOY_COOLDOWN_TICKS = 30;
      var MOVE_TO_BASE_TICKS = 90;
      var DEPLOY_SEARCH_RADIUS = 10;
      var MAX_SEARCH_ATTEMPTS = 50;

      function generateSearchCandidates(gameApi, centerX, centerY, radius) {
        var candidates = [];
        var mapApi = gameApi.mapApi;
        for (var r = 1; r <= radius; r++) {
          for (var dx = -r; dx <= r; dx++) {
            for (var dy = -r; dy <= r; dy++) {
              if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
              var x = centerX + dx;
              var y = centerY + dy;
              var tile = mapApi.getTile(x, y);
              if (!tile) continue;
              if (!mapApi.isPassableTile(tile, SpeedType.Track, false, false)) continue;
              var objects = mapApi.getObjectsOnTile(tile);
              if (objects.length > 0) continue;
              candidates.push(new Vector2(x, y));
            }
          }
        }
        return candidates;
      }

      var ExpansionMission = /** @class */ (function (Mission) {
        function ExpansionMission(uniqueName, priority, selectedMcv, logger, isExpanding) {
          Mission.call(this, uniqueName, logger);
          this.priority = priority;
          this.selectedMcv = selectedMcv;
          this.hasAttemptedDeployWith = null;
          this.isExpanding = isExpanding || false;
          this.deployAttemptCount = 0;
          this.searchCandidates = [];
          this.searchIndex = 0;
        }
        ExpansionMission.prototype = Object.create(Mission.prototype);
        ExpansionMission.prototype.constructor = ExpansionMission;

        ExpansionMission.prototype._onAiUpdate = function (gameApi, actionsApi, playerData, matchAwareness, actionBatcher) {
          var mcvTypes = gameApi.getGeneralRules().baseUnit || ["AMCV", "SMCV", "PCV"];
          var mcvs = this.getUnitsOfTypes.apply(this, [gameApi].concat(mcvTypes));
          if (mcvs.length === 0) {
            if (this.hasAttemptedDeployWith !== null) return disbandMission();
            if (this.selectedMcv) {
              return requestSpecificUnits([this.selectedMcv], this.priority);
            } else {
              return requestUnits(mcvTypes, this.priority);
            }
          }
          var mcv = mcvs[0];
          // MCV·¢ÏÖ£¬¾ö¶¨ÊÇÁ¢¼´Õ¹¿ª»¹ÊÇÒÆ¶¯µ½»ùµØÅÔ±ß
          if (!this.isExpanding) {
            // ÎÞ»ùµØ£ºÁ¢¼´Õ¹¿ª£¨³õÊ¼²¿Êð£©
            if (!this.hasAttemptedDeployWith || gameApi.getCurrentTick() > this.hasAttemptedDeployWith.gameTick + DEPLOY_COOLDOWN_TICKS) {
              actionsApi.orderUnits(mcvs.map(function (mcv) { return mcv.id; }), OrderType.DeploySelected);
              this.hasAttemptedDeployWith = { unitId: mcv.id, gameTick: gameApi.getCurrentTick() };
            }
          } else {
            // ÓÐ»ùµØ£ºÏÈÒÆ¶¯µ½¼¯½áµã£¬Õ¹¿ªÊ§°ÜÊ±ÔÚ10¸ñÄÚËÑË÷
            if (!this.hasAttemptedDeployWith) {
              var cyUnits = gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.constructionYard; });
              if (cyUnits.length > 0) {
                var cyData = gameApi.getGameObjectData(cyUnits[0]);
                if (cyData && cyData.tile) {
                  var rallyTarget = matchAwareness.getMainRallyPoint();
                  if (rallyTarget && rallyTarget.x >= 0 && rallyTarget.y >= 0) {
                    actionsApi.orderUnits([mcv.id], OrderType.Move, undefined, rallyTarget.x, rallyTarget.y);
                  } else {
                    actionsApi.orderUnits([mcv.id], OrderType.DeploySelected);
                  }
                  this.hasAttemptedDeployWith = { unitId: mcv.id, gameTick: gameApi.getCurrentTick(), stage: "move" };
                  this.deployAttemptCount = 0;
                  this.searchCandidates = [];
                  this.searchIndex = 0;
                }
              }
            } else {
              var elapsed = gameApi.getCurrentTick() - this.hasAttemptedDeployWith.gameTick;
              var stage = this.hasAttemptedDeployWith.stage || "deploy";
              if (stage === "move" && elapsed > MOVE_TO_BASE_TICKS) {
                actionsApi.orderUnits([mcv.id], OrderType.DeploySelected);
                this.hasAttemptedDeployWith = { unitId: mcv.id, gameTick: gameApi.getCurrentTick(), stage: "deploy" };
              } else if (stage === "deploy" && elapsed > DEPLOY_COOLDOWN_TICKS) {
                this.deployAttemptCount++;
                if (this.deployAttemptCount > MAX_SEARCH_ATTEMPTS) {
                  actionsApi.orderUnits([mcv.id], OrderType.DeploySelected);
                  this.hasAttemptedDeployWith.gameTick = gameApi.getCurrentTick();
                } else {
                  if (!this.searchCandidates.length) {
                    this.searchCandidates = generateSearchCandidates(gameApi, mcv.tile.rx, mcv.tile.ry, DEPLOY_SEARCH_RADIUS);
                    this.searchIndex = 0;
                  }
                  if (this.searchIndex < this.searchCandidates.length) {
                    var candidate = this.searchCandidates[this.searchIndex++];
                    actionsApi.orderUnits([mcv.id], OrderType.Move, undefined, candidate.x, candidate.y);
                    this.hasAttemptedDeployWith = { unitId: mcv.id, gameTick: gameApi.getCurrentTick(), stage: "move" };
                  } else {
                    actionsApi.orderUnits([mcv.id], OrderType.DeploySelected);
                    this.hasAttemptedDeployWith.gameTick = gameApi.getCurrentTick();
                  }
                }
              }
            }
          }
          return noop();
        };
        ExpansionMission.prototype.getGlobalDebugText = function () { return "Expand with MCV " + this.selectedMcv; };
        ExpansionMission.prototype.getPriority = function () { return this.priority; };
        return ExpansionMission;
      }(Mission));
      e("ExpansionMission", ExpansionMission);

      var ExpansionMissionFactory = /** @class */ (function () {
        function ExpansionMissionFactory() {}
        ExpansionMissionFactory.prototype.getName = function () { return "ExpansionMissionFactory"; };
        ExpansionMissionFactory.prototype.maybeCreateMissions = function (gameApi, playerData, matchAwareness, missionController, logger) {
          var mcvs = gameApi.getVisibleUnits(playerData.name, "self", function (r) { return gameApi.getGeneralRules().baseUnit.indexOf(r.name) !== -1; });
          var hasCY = gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.constructionYard; }).length > 0;
          // ÒÑÓÐ»ùµØÊ±£¬ÐÂMCVÏÈÒÆ¶¯µ½»ùµØÔÙÕ¹¿ª£»ÎÞ»ùµØÊ±Á¢¼´Õ¹¿ª
          mcvs.forEach(function (mcv) {
            missionController.addMission(new ExpansionMission("expand-with-" + mcv, 100, mcv, logger, hasCY));
          });
          // Èç¹ûÃ»ÓÐÎ´Õ¹¿ªµÄMCVÇÒÃ»ÓÐ»îÔ¾µÄÀ©ÕÅÈÎÎñ£¬µ«ÓÐÖØ¹¤£¬ÔòÇëÇóÉú²úÐÂMCV
          if (mcvs.length === 0) {
            var hasActiveExpansion = missionController.getMissions().some(function (m) { return m.getUniqueName().startsWith("expand-with-"); });
            if (!hasActiveExpansion) {
              var hasWarFactory = gameApi.getVisibleUnits(playerData.name, "self", function (r) { return r.name === "GAWEAP" || r.name === "NAWEAP" || r.name === "YAWEAP"; }).length > 0;
              if (hasWarFactory) {
                missionController.addMission(new ExpansionMission("expand-with-new", 100, null, logger, true));
              }
            }
          }
        };
        ExpansionMissionFactory.prototype.onMissionFailed = function () {};
        return ExpansionMissionFactory;
      }());
      e("ExpansionMissionFactory", ExpansionMissionFactory);
    },
  };
});
