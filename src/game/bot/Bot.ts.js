// === Reconstructed SystemJS module: game/bot/Bot ===
// deps: []
// Note: variable/type names are minified approximations of the original TypeScript.

System.register("game/bot/Bot", [], function (e, t) {
  "use strict";
  var i, r;
  t && t.id;
  return {
    setters: [],
    execute: function () {
      (e(
        "Bot",
        (r = class {
          get game() {
            return this.context?.game;
          }
          get player() {
            return this.context?.player;
          }
          get gameApi() {
            return this.context?.game;
          }
          get actionsApi() {
            return this.context?.player.actions;
          }
          get productionApi() {
            return this.context?.player.production;
          }
          get logger() {
            return this.context?.logger;
          }
          constructor(e, t) {
            ((this.name = e), (this.country = t), (this.nickname = ""), i.set(this, !1));
          }
          setContext(e) {
            ((this.context = e), this.context.logger.setDebugLevel(__classPrivateFieldGet(this, i, "f")));
          }
          setGameApi(e) {}
          setActionsApi(e) {}
          setProductionApi(e) {}
          setLogger(e) {}
          setDebugMode(e) {
            return (__classPrivateFieldSet(this, i, e, "f"), this.context?.logger.setDebugLevel(e), this);
          }
          getDebugMode() {
            return __classPrivateFieldGet(this, i, "f");
          }
          onGameInit(e) {}
          onGameStart(e) {}
          onGameTick(e) {}
          onGameEvent(e, t) {}
          // 聊天消息钩子：当收到玩家聊天时由BotManager调用
          // senderName: 发送者名称, message: 消息文本
          onChatMessage(senderName, message, gameApi) {}
        }),
      ),
        (i = new WeakMap()));
    },
  };
});
