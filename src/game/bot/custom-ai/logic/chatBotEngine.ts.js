// === Custom AI module: game/bot/custom-ai/logic/chatBotEngine ===
// 聊天Bot引擎逻辑，文本数据在 chatLines.ts.js 中单独维护
System.register("game/bot/custom-ai/logic/chatBotEngine", ["game/bot/custom-ai/logic/chatLines"], function (e, t) {
  "use strict";
  var ChatLines;
  t && t.id;
  return {
    setters: [
      function (x) { ChatLines = x; },
    ],
    execute: function () {
      var PERSONALITY_TYPES = ChatLines.PERSONALITY_TYPES;
      var LINES = ChatLines.LINES;

      // 主动消息概率
      var PROACTIVE_CHAT_RATE = 0.35;

      // 冷却参数
      var MIN_COOLDOWN = 360;
      var MAX_COOLDOWN = 1200;

      // 随机选择
      var pickRandom = function (arr, gameApi) {
        if (!arr || arr.length === 0) return "";
        var idx = gameApi ? gameApi.generateRandomInt(0, arr.length - 1) : Math.floor(Math.random() * arr.length);
        return arr[idx];
      };

      // ============================================================
      // ChatBotEngine 类
      // ============================================================
      var ChatBotEngine = function (logger) {
        this.logger = logger || function () {};
        this.personalityType = null;
        this.lines = null;
        this.lastChatTick = -MIN_COOLDOWN;
        this.lastEventTick = {};
        this.lastStateMsgTick = -MIN_COOLDOWN;
        this.cooldown = MIN_COOLDOWN;
        this.gameStartTick = -1;
        this.hasGreeted = false;
        this.hasSaidGG = false;
        this.attackAnnounced = false;
        this.expandAnnounced = false;
        this.lastUnitCount = 0;
        this.lastEnemyCount = 0;
      };

      ChatBotEngine.prototype.init = function (personalityType, gameApi) {
        this.personalityType = personalityType || PERSONALITY_TYPES.XIAOXUESHENG;
        this.lines = LINES[this.personalityType];
        this.gameStartTick = gameApi ? gameApi.getCurrentTick() : 0;
        this.logger("[CHAT] 性格=" + (ChatLines.PERSONALITY_NAMES[this.personalityType] || this.personalityType));
      };

      ChatBotEngine.prototype.canChat = function (gameApi, eventType) {
        var tick = gameApi.getCurrentTick();
        if (eventType) {
          var halfCd = Math.floor(this.cooldown * 0.5);
          var last = this.lastEventTick[eventType] || -halfCd;
          if (tick - last < halfCd) return false;
        }
        if (tick - this.lastChatTick < this.cooldown) return false;
        return true;
      };

      ChatBotEngine.prototype.generateMessage = function (gameApi, playerData, matchAwareness, eventType) {
        if (!this.lines) return null;
        var tick = gameApi.getCurrentTick();

        if (!this.hasGreeted && tick > 30 && tick < 600) {
          if (this.canChat(gameApi, "greeting")) {
            this.hasGreeted = true;
            this.lastChatTick = tick;
            this.lastEventTick["greeting"] = tick;
            return pickRandom(this.lines.greeting, gameApi);
          }
        }

        if (eventType && this.canChat(gameApi, eventType)) {
          var msg = this._eventMessage(gameApi, eventType);
          if (msg) {
            this.lastChatTick = tick;
            this.lastEventTick[eventType] = tick;
            return msg;
          }
        }

        if (!eventType && this.canChat(gameApi)) {
          var stateMsg = this._stateMessage(gameApi, playerData);
          if (stateMsg) {
            this.lastChatTick = tick;
            return stateMsg;
          }
        }

        return null;
      };

      ChatBotEngine.prototype._eventMessage = function (gameApi, eventType) {
        switch (eventType) {
          case "praise":
            if (Math.random() >= PROACTIVE_CHAT_RATE) return null;
            return pickRandom(this.lines.praise, gameApi);
          case "taunt":
            if (Math.random() >= PROACTIVE_CHAT_RATE) return null;
            return pickRandom(this.lines.taunt, gameApi);
          case "attack":
            if (!this.attackAnnounced) {
              this.attackAnnounced = true;
              return pickRandom(this.lines.attack, gameApi);
            }
            break;
          case "expand":
            if (!this.expandAnnounced) {
              this.expandAnnounced = true;
              return pickRandom(this.lines.expand, gameApi);
            }
            break;
          case "superWeapon":
            if (Math.random() >= PROACTIVE_CHAT_RATE) return null;
            return pickRandom(this.lines.superWeapon, gameApi);
          case "scouting":
            if (Math.random() >= PROACTIVE_CHAT_RATE) return null;
            return pickRandom(this.lines.scouting, gameApi);
          case "gg":
            if (!this.hasSaidGG) {
              this.hasSaidGG = true;
              return pickRandom(this.lines.gg, gameApi);
            }
            break;
        }
        return null;
      };

      ChatBotEngine.prototype._stateMessage = function (gameApi, playerData) {
        var tick = gameApi.getCurrentTick();
        if (tick - this.lastStateMsgTick < MIN_COOLDOWN) return null;
        try {
          var selfCount = gameApi.getVisibleUnits(playerData.name, "self", function (r) {
            return r.isSelectableCombatant;
          }).length;
          var enemyCount = gameApi.getVisibleUnits(playerData.name, "enemy", function (r) {
            return r.isSelectableCombatant;
          }).length;

          if (tick > 1800 && selfCount > 0 && enemyCount > 0) {
            var ratio = selfCount / enemyCount;
            if (ratio > 2.5 && Math.random() < 0.12) {
              this.lastStateMsgTick = tick;
              return pickRandom(this.lines.winning, gameApi);
            }
            if (enemyCount > 0 && ratio < 0.4 && Math.random() < 0.12) {
              this.lastStateMsgTick = tick;
              return pickRandom(this.lines.losing, gameApi);
            }
            if (Math.abs(selfCount - enemyCount) < 5 && Math.random() < 0.06) {
              this.lastStateMsgTick = tick;
              return Math.random() < 0.5
                ? pickRandom(this.lines.praise, gameApi)
                : pickRandom(this.lines.taunt, gameApi);
            }
          }
          this.lastUnitCount = selfCount;
          this.lastEnemyCount = enemyCount;
        } catch (_) {}
        return null;
      };

      ChatBotEngine.prototype.generateReply = function (gameApi, senderName, message) {
        if (!this.lines) return null;
        var tick = gameApi.getCurrentTick();
        if (tick - this.lastChatTick < this.cooldown) return null;

        var msg = message.toLowerCase();
        var reply = null;

        if (msg.indexOf("666") >= 0 || msg.indexOf("牛逼") >= 0 || msg.indexOf("厉害") >= 0 || msg.indexOf("强") >= 0) {
          if (this.personalityType === PERSONALITY_TYPES.XIAOXUESHENG) reply = "那必须的！我很猛的好吧！";
          else if (this.personalityType === PERSONALITY_TYPES.DAXUESHENG) reply = "哈哈运气运气。";
          else if (this.personalityType === PERSONALITY_TYPES.YINU) reply = "废话，你以为我跟你闹呢？";
          else reply = "随缘随缘。";
        }
        else if (msg.indexOf("菜") >= 0 || msg.indexOf("垃圾") >= 0 || msg.indexOf("辣鸡") >= 0 || msg.indexOf("noob") >= 0) {
          if (this.personalityType === PERSONALITY_TYPES.XIAOXUESHENG) reply = "你才菜！你全家都菜！";
          else if (this.personalityType === PERSONALITY_TYPES.DAXUESHENG) reply = "急了急了？";
          else if (this.personalityType === PERSONALITY_TYPES.YINU) reply = "你特么说谁呢？出来单挑！";
          else reply = "不要急，伤身体。";
        }
        else if (msg.indexOf("hi") >= 0 || msg.indexOf("hello") >= 0 || msg.indexOf("你好") >= 0 || msg.indexOf("嗨") >= 0) {
          reply = pickRandom(this.lines.greeting, gameApi);
        }
        else if (msg.indexOf("?") >= 0 || msg.indexOf("？") >= 0) {
          if (this.personalityType === PERSONALITY_TYPES.YINU) reply = "问什么问？打就完了！";
          else if (this.personalityType === PERSONALITY_TYPES.FOXI) reply = "一切随缘，不要急。";
          else if (Math.random() < 0.4) reply = pickRandom(this.lines.taunt, gameApi);
        }
        else if (msg.indexOf("gg") >= 0) {
          reply = pickRandom(this.lines.gg, gameApi);
        }

        if (reply) this.lastChatTick = tick;
        return reply;
      };

      e("ChatBotEngine", ChatBotEngine);
    },
  };
});
