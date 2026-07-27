// === Custom AI module: game/bot/custom-ai/CustomAiBot ===
// RA2WEBCustomBot - ported from ra2web-custom-ai-main
// 修改：集成聊天Bot引擎(ChatBotEngine)，实现拟人化聊天
System.register("game/bot/custom-ai/CustomAiBot", [
  "game/api/index",
  "game/bot/custom-ai/logic/map/map",
  "game/bot/custom-ai/logic/map/sector",
  "game/bot/custom-ai/logic/mission/missionController",
  "game/bot/custom-ai/logic/building/queueController",
  "game/bot/custom-ai/logic/awareness",
  "game/bot/custom-ai/logic/common/utils",
  "game/bot/custom-ai/logic/chatBotEngine",
  "game/bot/custom-ai/logic/chatLines",
  "game/ai/AiApi"
], function (e, t) {
  "use strict";
  var A, MapMod, SectorMod, MissionCtrlMod, QueueCtrlMod, AwareMod, Utils, ChatBotMod, ChatLinesMod, AiApi;
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
      function (x) { ChatBotMod = x; },
      function (x) { ChatLinesMod = x; },
      function (x) { AiApi = x.AiApi; },
    ],
    execute: function () {
      var Bot = A.Bot;
      var ApiEventType = A.ApiEventType;
      var ObjectType = A.ObjectType;
      var FactoryType = A.FactoryType;
      var SideType = A.SideType;
      var Countries = Utils.Countries;
      var formatTimeDuration = Utils.formatTimeDuration;
      var ChatBotEngine = ChatBotMod.ChatBotEngine;
      var randomPersonality = ChatLinesMod.randomPersonality;
      var randomNickname = ChatLinesMod.randomNickname;

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
          // 聊天Bot引擎
          this.chatBot = new ChatBotEngine(this.enableLogging ? function (msg) { this.logger.info(msg); }.bind(this) : function () {});
          // 随机偏移聊天检测时间，避免所有Bot同时说话
          this._chatCheckPhase = Math.floor(Math.random() * 60);
          this._lastChatCheckTick = -this._chatCheckPhase;
          this._lastEventUnitCount = 0;
          this._lastAIChatReplyTick = -600;
          // 延迟回复队列
          this._pendingReply = null;
          this._pendingReplyAt = 0;
          // AIMD.INI 策略引擎
          this.aiApi = null;
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

          // 初始化聊天Bot引擎（随机分配性格，不依赖阵营）
          var pType = randomPersonality(game);
          this.chatBot.init(pType, game);
          // 分配随机昵称（与性格绑定）
          this.nickname = randomNickname(pType, game);
          this.logger.info("[NICK] 昵称=" + this.nickname + " 性格=" + (ChatLinesMod.PERSONALITY_NAMES[pType] || pType));

          // 初始化 AIMD.INI 策略引擎（若 AI 配置文件可用）
          try {
            this.aiApi = new AiApi(game, this.actionsApi, this.name);
            this.aiApi.init();
            this.logger.info("[AiApi] AIMD.INI engine initialized");
          } catch (e) {
            this.logger.info("[AiApi] AIMD.INI engine not available: " + e.message);
          }

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

            // 更新 AIMD.INI 策略引擎
            if (this.aiApi) {
              this.aiApi.onTick();
            }

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

            // 聊天Bot：每 tickRatio 检查是否要说话
            this.updateChat(game, myPlayer, armyUnits);
          }
        }

        // ============================================================
        // 聊天Bot更新逻辑
        // ============================================================
        updateChat(game, myPlayer, armyUnits) {
          var tick = game.getCurrentTick();

          // 先处理延迟回复（到时间了就发送）
          if (this._pendingReply && tick >= this._pendingReplyAt) {
            this.sendChatMessage(this._pendingReply);
            this._pendingReply = null;
            this._pendingReplyAt = 0;
          }

          // 随机间隔检查（180~420 tick ≈ 12~28秒），避免频繁说话
          var chatInterval = 180 + Math.floor(Math.random() * 241);
          if (tick - this._lastChatCheckTick < chatInterval) return;
          this._lastChatCheckTick = tick;

          var enemyUnits = [];
          try {
            enemyUnits = game.getVisibleUnits(this.name, "enemy", function (r) { return r.isSelectableCombatant; });
          } catch (_) {}

          // 检测游戏事件并触发聊天
          var eventType = null;

          // 单位大量损失 → 敌人打得好 → praise（夸对面）
          if (this._lastEventUnitCount > 0 && armyUnits.length < this._lastEventUnitCount * 0.6) {
            eventType = "praise";
          }

          // 进攻开始
          if (!this.chatBot.attackAnnounced && armyUnits.length >= 10 && tick > 900) {
            eventType = "attack";
          }

          // 扩张
          var constructionYards = game.getVisibleUnits(this.name, "self", function (r) { return r.constructionYard; });
          if (!this.chatBot.expandAnnounced && constructionYards.length > 1) {
            eventType = "expand";
          }

          // 超级武器
          try {
            var superWeapons = game.getAllSuperWeaponData();
            for (var i = 0; i < superWeapons.length; i++) {
              if (superWeapons[i].playerName === this.name && superWeapons[i].status === "ready") {
                eventType = "superWeapon";
                break;
              }
            }
          } catch (_) {}

          // 根据兵力对比决定夸还是怼（如果还没有其他事件）
          if (!eventType && armyUnits.length > 0 && enemyUnits.length > 0) {
            if (armyUnits.length > enemyUnits.length * 2.5) {
              // 我大优势 → taunt（嘲讽对面）
              eventType = "taunt";
            } else if (enemyUnits.length > armyUnits.length * 2.5) {
              // 对面大优势 → praise（夸对面打得好）
              eventType = "praise";
            } else if (Math.abs(armyUnits.length - enemyUnits.length) < 3 && Math.random() < 0.3) {
              // 焦灼 → 随机夸或怼
              eventType = Math.random() < 0.5 ? "praise" : "taunt";
            }
          }

          // 生成并发送消息
          var message = this.chatBot.generateMessage(game, myPlayer, this.matchAwareness, eventType);
          if (message) {
            this.sendChatMessage(message);
          }

          this._lastEventUnitCount = armyUnits.length;
          this._lastEnemyCount = enemyUnits.length;
        }

        // 发送聊天消息
        sendChatMessage(message) {
          if (this.enableLogging) {
            this.logger.info("[CHAT] " + message);
          }
          this.actionsApi.sayAll(message);
        }

        // 聊天消息回调：收到玩家消息时处理
        onChatMessage(senderName, message, gameApi) {
          if (!this.chatBot || !this.chatBot.personality) return;
          // 不回复自己的消息（检查内部名和昵称）
          if (senderName === this.name || senderName === this.nickname) return;

          // 判断发送者是否为AI（用于AI互聊概率控制）
          var isAISender = false;
          try {
            var senderData = gameApi.getPlayerData(senderName);
            isAISender = senderData && senderData.isAi;
          } catch (_) {}

          if (isAISender) {
            // AI之间：低概率回复 + 独立冷却，避免无限循环刷屏
            if (Math.random() > 0.2) return;
            if (gameApi.getCurrentTick() - this._lastAIChatReplyTick < 600) return;
            this._lastAIChatReplyTick = gameApi.getCurrentTick();
          }

          var reply = this.chatBot.generateReply(gameApi, senderName, message);
          if (reply) {
            // 如果已有待发送的回复，不覆盖（避免堆叠）
            if (this._pendingReply) return;
            // 延迟回复（90~240 tick ≈ 6~16秒），模拟真人思考
            var delay = 90 + Math.floor(Math.random() * 151);
            this._pendingReply = reply;
            this._pendingReplyAt = gameApi.getCurrentTick() + delay;
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
          // AiApi 信息
          if (this.aiApi) {
            var tl = this.aiApi.getTechLevel();
            var tac = this.aiApi.getTacticalAdvice();
            var teams = this.aiApi.getActiveTeams();
            globalDebugText += "AiApi: TechLv=" + tl + " Stance=" + tac.stance + " Threat=" + tac.threatLevel;
            if (teams.length > 0) {
              globalDebugText += " Teams=" + teams.length;
            }
            globalDebugText += "\n";
          }

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
