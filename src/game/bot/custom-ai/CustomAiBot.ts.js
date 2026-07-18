// === Custom AI module: game/bot/custom-ai/CustomAiBot ===
// RA2WEBCustomBot - ported from ra2web-custom-ai-main
System.register("game/bot/custom-ai/CustomAiBot", [
  "game/api/index",
  "game/bot/custom-ai/logic/map/map",
  "game/bot/custom-ai/logic/map/sector",
  "game/bot/custom-ai/logic/mission/missionController",
  "game/bot/custom-ai/logic/building/queueController",
  "game/bot/custom-ai/logic/awareness",
  "game/bot/custom-ai/logic/common/utils"
], function (e, t) {
  "use strict";
  var A, MapMod, SectorMod, MissionCtrlMod, QueueCtrlMod, AwareMod, Utils;
  t && t.id;
  return {
    setters: [
      function (x) { A = x; },
      function (x) { MapMod = x; },
      function (x) { SectorMod = x; },
      function (x) { MissionCtrlMod = x; },
      function (x) { QueueCtrlMod = x; },
      function (x) { AwareMod = x; },
      function (x) { Utils = x; },
    ],
    execute: function () {
      var Bot = A.Bot;
      var ApiEventType = A.ApiEventType;
      var ObjectType = A.ObjectType;
      var FactoryType = A.FactoryType;
      var Countries = Utils.Countries;
      var formatTimeDuration = Utils.formatTimeDuration;

      var DEBUG_STATE_UPDATE_INTERVAL_SECONDS = 6;
      var NATURAL_TICK_RATE = 15;

      class RA2WEBCustomBot extends Bot {
        constructor(name, country, tryAllyWith, enableLogging) {
          super(name, country);
          this.tryAllyWith = tryAllyWith || [];
          this.enableLogging = enableLogging !== undefined ? enableLogging : true;
          this.tickRatio = undefined;
          this.knownMapBounds = undefined;
          this.matchAwareness = null;
          this.tickOfLastAttackOrder = 0;
          this.missionController = new MissionCtrlMod.MissionController(
            function (message, sayInGame) { this.logBotStatus(message, sayInGame); }.bind(this)
          );
          this.queueController = new QueueCtrlMod.QueueController();
          this._lastCredits = null;
          this._incomeMultiplier = 5.0;
        }

        onGameStart(game) {
          var gameRate = game.getTickRate();
          var botApm = 300;
          var botRate = botApm / 60;
          this.tickRatio = Math.ceil(gameRate / botRate);

          this.knownMapBounds = MapMod.determineMapBounds(game.mapApi);
          var myPlayer = game.getPlayerData(this.name);

          // 硬编码：AI 初始资金加成 (+100000)
          game.addPlayerCredits(this.name, 100000);
          this._lastCredits = game.getPlayerData(this.name).credits;

          this.matchAwareness = new AwareMod.MatchAwarenessImpl(
            null,
            new SectorMod.SectorCache(game.mapApi, this.knownMapBounds),
            myPlayer.startLocation,
            function (message, sayInGame) { this.logBotStatus(message, sayInGame); }.bind(this)
          );
          this.matchAwareness.onGameStart(game, myPlayer);

          this.logBotStatus("Map bounds: " + this.knownMapBounds.width + ", " + this.knownMapBounds.height);

          var _this = this;
          this.tryAllyWith
            .filter(function (playerName) { return playerName !== _this.name; })
            .forEach(function (playerName) { _this.actionsApi.toggleAlliance(playerName, true); });
        }

        onGameTick(game) {
          if (!this.matchAwareness) return;

          // 硬编码：AI 采矿收入倍率
          var currentCredits = game.getPlayerData(this.name).credits;
          if (this._lastCredits !== null && currentCredits > this._lastCredits) {
            var income = currentCredits - this._lastCredits;
            var bonus = Math.floor(income * (this._incomeMultiplier - 1.0));
            if (bonus > 0) {
              game.addPlayerCredits(this.name, bonus);
              currentCredits += bonus;
            }
          }
          this._lastCredits = currentCredits;

          var threatCache = this.matchAwareness.getThreatCache();

          if ((game.getCurrentTick() / NATURAL_TICK_RATE) % DEBUG_STATE_UPDATE_INTERVAL_SECONDS === 0) {
            this.updateDebugState(game);
          }

          if (game.getCurrentTick() % this.tickRatio === 0) {
            var myPlayer = game.getPlayerData(this.name);
            this.matchAwareness.onAiUpdate(game, myPlayer);

            var armyUnits = game.getVisibleUnits(this.name, "self", function (r) { return r.isSelectableCombatant; });
            var mcvUnits = game.getVisibleUnits(this.name, "self", function (r) {
              return r.deploysInto && game.getGeneralRules().baseUnit.indexOf(r.name) >= 0;
            });
            var productionBuildings = game.getVisibleUnits(this.name, "self", function (r) {
              return r.type === ObjectType.Building && r.factory !== FactoryType.None;
            });
            if (armyUnits.length === 0 && productionBuildings.length === 0 && mcvUnits.length === 0) {
              this.logBotStatus("No army or production left, quitting.");
              this.actionsApi.quitGame();
            }

            if (this.gameApi.getCurrentTick() % 3 === 0) {
              this.missionController.onAiUpdate(game, this.actionsApi, myPlayer, this.matchAwareness);
            }

            var unitTypeRequests = this.missionController.getRequestedUnitTypes();
            this.queueController.onAiUpdate(
              game,
              this.productionApi,
              this.actionsApi,
              myPlayer,
              threatCache,
              unitTypeRequests,
              function (message) { this.logBotStatus(message); }.bind(this)
            );
          }
        }

        getHumanTimestamp(game) {
          return formatTimeDuration(game.getCurrentTick() / NATURAL_TICK_RATE);
        }

        logBotStatus(message, sayInGame) {
          if (!this.enableLogging) return;
          var gameTimestamp = this.getHumanTimestamp(this.gameApi);
          var formattedMsg = "[" + gameTimestamp + "] " + message;
          this.logger.info(formattedMsg);
          if (sayInGame) {
            this.actionsApi.sayAll(gameTimestamp + ": " + message);
          }
        }

        updateDebugState(game) {
          if (!this.getDebugMode()) return;
          var myPlayer = game.getPlayerData(this.name);
          var harvesters = game.getVisibleUnits(this.name, "self", function (r) { return r.harvester; }).length;

          var globalDebugText = "Cash: " + myPlayer.credits + " | Harvesters: " + harvesters + "\n";
          globalDebugText += this.queueController.getGlobalDebugText(this.gameApi, this.productionApi);
          globalDebugText += this.missionController.getGlobalDebugText(this.gameApi);
          globalDebugText += this.matchAwareness ? this.matchAwareness.getGlobalDebugText() : "";

          this.missionController.updateDebugText(this.actionsApi);

          var _this = this;
          game.getVisibleUnits(this.name, "enemy").forEach(function (unitId) {
            _this.actionsApi.setUnitDebugText(unitId, unitId.toString());
          });

          this.actionsApi.setGlobalDebugText(globalDebugText);
        }

        onGameEvent(ev) {
          switch (ev.type) {
            case ApiEventType.ObjectDestroy:
              if (ev.attackerInfo && ev.attackerInfo.playerName === this.name) {
                this.tickOfLastAttackOrder += (this.gameApi.getCurrentTick() - this.tickOfLastAttackOrder) / 2;
              }
              break;
            default:
              break;
          }
        }
      }

      e("RA2WEBCustomBot", RA2WEBCustomBot);
    },
  };
});
