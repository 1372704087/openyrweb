// === Reconstructed SystemJS module: game/BotManager ===
// deps: ["util/disposable/CompositeDisposable","util/Logger","game/action/ActionQueue","game/api/ActionsApi","game/api/EventsApi","game/api/GameApi","game/api/LoggerApi","game/api/ProductionApi","game/api/PlayerApi","game/bot/BotContext"]
// Note: variable/type names are minified approximations of the original TypeScript.

System.register(
  "game/BotManager",
  [
    "util/disposable/CompositeDisposable",
    "util/Logger",
    "game/action/ActionQueue",
    "game/api/ActionsApi",
    "game/api/EventsApi",
    "game/api/GameApi",
    "game/api/LoggerApi",
    "game/api/ProductionApi",
    "game/api/PlayerApi",
    "game/bot/BotContext",
  ],
  function (e, t) {
    "use strict";
    var a, o, s, l, c, h, u, d, g, p, i;
    t && t.id;
    return {
      setters: [
        function (e) {
          a = e;
        },
        function (e) {
          o = e;
        },
        function (e) {
          s = e;
        },
        function (e) {
          l = e;
        },
        function (e) {
          c = e;
        },
        function (e) {
          h = e;
        },
        function (e) {
          u = e;
        },
        function (e) {
          d = e;
        },
        function (e) {
          g = e;
        },
        function (e) {
          p = e;
        },
      ],
      execute: function () {

        // ============================================================
        // BotChatSender: 聊天发送器桥接
        // 实现 sayAll(playerName, text) 方法，使 ActionsApi.sayAll 生效
        // 消息存入队列，由外部网络层通过 flushChatMessages() 取出发送
        // ============================================================
        var BotChatSender = function () {
          this.messageQueue = [];
        };
        BotChatSender.prototype.sayAll = function (playerName, text) {
          if (text && text.length > 0) {
            this.messageQueue.push({ playerName: playerName, text: text, time: Date.now() });
          }
        };
        BotChatSender.prototype.flushMessages = function () {
          var msgs = this.messageQueue;
          this.messageQueue = [];
          return msgs;
        };
        BotChatSender.prototype.hasMessages = function () {
          return this.messageQueue.length > 0;
        };

        e(
          "BotManager",
          (i = class {
            static factory(e, t, i, r) {
              return new this(e, new s.ActionQueue(), t, i, r);
            }
            constructor(e, t, i, r, s) {
              ((this.actionFactory = e),
                (this.actionQueue = t),
                (this.botFactory = i),
                (this.botDebugIndex = r),
                (this.actionLogger = s),
                (this.bots = new Map()),
                (this.disposables = new a.CompositeDisposable()),
                // 聊天系统
                (this.chatSender = new BotChatSender()),
                (this.chatMessageQueue = []));
            }

            // 获取待发送的聊天消息（供外部网络层调用）
            flushChatMessages() {
              var msgs = this.chatSender.flushMessages();
              return msgs;
            }

            // 接收外部聊天消息并分发给所有Bot
            dispatchChatMessage(senderName, message) {
              if (!senderName || !message) return;
              this.bots.forEach((bot) => {
                try {
                  bot.onChatMessage?.(senderName, message, this.gameApi);
                } catch (err) {
                  // 忽略Bot处理聊天消息时的错误
                }
              });
            }
            init(t) {
              this.gameApi = new h.GameApi(t, !0);
              this._game = t; // 保存Game对象引用，用于设置昵称映射
              let e = new c.EventsApi(t.events);
              var i, r;
              for (i of t.getCombatants().filter((e) => e.isAi)) this.bots.set(i, this.botFactory.create(i));
              this.updateDebugBotIndex(this.botDebugIndex.value, t);
              let s = (e) => this.updateDebugBotIndex(e, t);
              (this.botDebugIndex.onChange.subscribe(s),
                this.disposables.add(() => this.botDebugIndex.onChange.unsubscribe(s)),
                e.subscribe((t) => this.bots.forEach((e) => e.onGameEvent(t, this.gameApi))),
                this.disposables.add(e));
              for (r of this.bots.values()) {
                var a = new g.PlayerApi(
                    r.name,
                    this.gameApi,
                    // 传入第5个参数 chatSender，使 ActionsApi.sayAll 生效
                    new l.ActionsApi(t, this.actionFactory, this.actionQueue, r, this.chatSender),
                    new d.ProductionApi(t.getPlayerByName(r.name).production),
                  ),
                  n = new u.LoggerApi(o.AppLogger.get(r.name), this.gameApi);
                (r.setGameApi(this.gameApi),
                  r.setActionsApi(a.actions),
                  r.setProductionApi(a.production),
                  r.setLogger(n),
                  r.setContext?.(new p.BotContext(this.gameApi, a, n)),
                  r.onGameInit?.(this.gameApi));
              }
            }
            onGameStart() {
              if (!this.gameApi) throw new Error("Bot manager is not initialized");
              for (var e of this.bots.values()) e.onGameStart(this.gameApi);
              // 将Bot昵称同步到Game对象和玩家对象，供所有UI层使用
              if (this.bots.size > 0 && this._game) {
                if (!this._game.aiPlayerNicknames) {
                  this._game.aiPlayerNicknames = {};
                }
                this.bots.forEach(function (bot) {
                  if (bot.nickname) {
                    this._game.aiPlayerNicknames[bot.name] = bot.nickname;
                    // 在玩家对象上设置 displayName 属性（UI组件读取，不影响内部name查找）
                    try {
                      var p = this._game.getPlayerByName(bot.name);
                      if (p) {
                        p.displayName = bot.nickname;
                      }
                    } catch (_) {}
                  }
                }.bind(this));
              }
            }
            update(e) {
              var t, i;
              for (t of this.actionQueue.dequeueAll()) {
                t.process();
                var r = t.print();
                r && this.actionLogger.debug(`(${t.player.name})@${e.currentTick}: ` + r);
              }
              for (i of e.getCombatants().filter((e) => e.isAi)) this.bots.get(i).onGameTick(this.gameApi);
              // 自动Flush AI聊天消息到Game队列（单机模式），供GUI层消费
              var chatMsgs = this.flushChatMessages();
              for (var cm = 0; cm < chatMsgs.length; cm++) {
                var msg = chatMsgs[cm];
                // 查找Bot的昵称（bots map key是Player对象，需要遍历匹配name）
                var nickname = msg.playerName;
                this.bots.forEach(function (bot) {
                  if (bot.name === msg.playerName && bot.nickname) {
                    nickname = bot.nickname;
                  }
                });
                if (e.aiChatMessages) {
                  e.aiChatMessages.push({
                    playerName: msg.playerName,
                    nickname: nickname,
                    text: msg.text,
                    time: msg.time
                  });
                }
                // 把AI消息分发给所有Bot（使用昵称作为发送者名）
                this.dispatchChatMessage(nickname, msg.text);
              }
            }
            updateDebugBotIndex(e, t) {
              var i,
                r = 0 < e ? t.getAiPlayerName(e) : void 0;
              for (i of this.bots.values()) i.setDebugMode(i.name === r);
            }
            dispose() {
              ((this.gameApi = void 0), this.bots.clear(), this.disposables.dispose());
            }
          }),
        );
      },
    };
  },
);
