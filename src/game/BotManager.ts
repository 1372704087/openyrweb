/**
 * BotManager — AI/战役脚本 Bot 的生命周期与每 tick 驱动。
 *
 * 职责：
 *  - factory/ctor：持有 actionFactory、actionQueue、botFactory、调试索引、日志；
 *  - init：为 AI 与「战役人类阵营」创建 Bot，注入 GameApi/Actions/Production/Logger/Context；
 *  - onGameStart：转发到各 Bot，并同步昵称到 game.aiPlayerNicknames / player.displayName；
 *  - update：每 tick 出队 Action 执行并 log，再驱动 AI 与战役 Bot 的 onGameTick，
 *    同时 flush 本侧聊天消息到 game.aiChatMessages 并回广播给全部 Bot；
 *  - BotChatSender：ActionsApi.sayAll 的桥接队列（flushMessages 取走）。
 *  - dispose：清空 Bot 与订阅。
 *
 * 由 game/BotManager.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { CompositeDisposable } from "util/disposable/CompositeDisposable"; // 已转换
import { AppLogger } from "util/Logger"; // 已转换
import { ActionQueue } from "game/action/ActionQueue"; // 已转换
import * as ActionsApiModule from "game/api/ActionsApi"; // 孪生
import * as EventsApiModule from "game/api/EventsApi"; // 孪生
import * as GameApiModule from "game/api/GameApi"; // 孪生
import * as LoggerApiModule from "game/api/LoggerApi"; // 孪生
import * as ProductionApiModule from "game/api/ProductionApi"; // 孪生
import * as PlayerApiModule from "game/api/PlayerApi"; // 孪生
import * as BotContextModule from "game/bot/BotContext"; // 孪生
// 孪生 any-shim：未转换模块的具名导出不可用，取命名空间成员
const ActionsApi: any = (ActionsApiModule as any).ActionsApi;
const EventsApi: any = (EventsApiModule as any).EventsApi;
const GameApi: any = (GameApiModule as any).GameApi;
const LoggerApi: any = (LoggerApiModule as any).LoggerApi;
const ProductionApi: any = (ProductionApiModule as any).ProductionApi;
const PlayerApi: any = (PlayerApiModule as any).PlayerApi;
const BotContext: any = (BotContextModule as any).BotContext;

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 聊天发送器桥接：
 * 实现 sayAll(playerName, text)，使 ActionsApi.sayAll 生效；
 * 消息入队，由外部网络层经 flushChatMessages() / flushMessages() 取走发送。
 */
class BotChatSender {
  /** 待发送消息队列。 */
  messageQueue: any[] = [];

  sayAll(playerName: any, text: any): void {
    if (text && text.length > 0) {
      this.messageQueue.push({ playerName: playerName, text: text, time: Date.now() });
    }
  }

  /** 取走并清空队列。 */
  flushMessages(): any[] {
    var msgs = this.messageQueue;
    this.messageQueue = [];
    return msgs;
  }

  /** 是否还有未发送消息。 */
  hasMessages(): boolean {
    return this.messageQueue.length > 0;
  }
}

export class BotManager {
  /** 动作工厂（注册/创建 Action）。 */
  actionFactory: any;
  /** 待处理动作队列。 */
  actionQueue: any;
  /** Bot 工厂。 */
  botFactory: any;
  /** 调试高亮的 AI 序号（BoxedVar 风格）。 */
  botDebugIndex: any;
  /** 动作日志器。 */
  actionLogger: any;
  /** 玩家 → Bot 映射。 */
  bots: Map<any, any>;
  /** 订阅/回调释放集合。 */
  disposables: any;
  /** 聊天发送器（sayAll 桥接）。 */
  chatSender: any;
  /** 兼容字段：与孪生一致的空数组占位。 */
  chatMessageQueue: any[];
  /** 当前 GameApi（init 后可用）。 */
  gameApi: any;
  /** Game 引用（昵称同步用）。 */
  private _game: any;

  /** 静态工厂：自动创建 ActionQueue 后走构造。 */
  static factory(actionFactory: any, botFactory: any, botDebugIndex: any, actionLogger: any): any {
    return new this(actionFactory, new ActionQueue(), botFactory, botDebugIndex, actionLogger);
  }

  constructor(actionFactory: any, actionQueue: any, botFactory: any, botDebugIndex: any, actionLogger: any) {
    this.actionFactory = actionFactory;
    this.actionQueue = actionQueue;
    this.botFactory = botFactory;
    this.botDebugIndex = botDebugIndex;
    this.actionLogger = actionLogger;
    this.bots = new Map();
    this.disposables = new CompositeDisposable();
    // 聊天系统
    this.chatSender = new BotChatSender();
    this.chatMessageQueue = [];
  }

  /** 获取待发送的聊天消息（供外部网络层调用）。 */
  flushChatMessages(): any {
    var msgs = this.chatSender.flushMessages();
    return msgs;
  }

  /** 接收外部聊天消息并分发给所有 Bot（错误静默忽略）。 */
  dispatchChatMessage(senderName: any, message: any): void {
    if (!senderName || !message) return;
    this.bots.forEach((bot) => {
      try {
        bot.onChatMessage?.(senderName, message, this.gameApi);
      } catch (err) {
        // 忽略Bot处理聊天消息时的错误
      }
    });
  }

  /** 初始化：为 AI 与战役人类阵营建 Bot，并注入各子 API。 */
  init(game: any): void {
    this.gameApi = new GameApi(game, true);
    this._game = game; // 保存Game对象引用，用于设置昵称映射
    let eventsApi = new EventsApi(game.events);
    var player: any;
    for (player of game.getCombatants().filter((e: any) => e.isAi)) this.bots.set(player, this.botFactory.create(player));
    // 战役人类阵营没有常规 AI Bot，但也需要脚本小队引擎
    // （CreateTeam 等触发器动作对任意阵营都可用，参考临时源码 scenarioTeamRuntime）。
    for (player of game.getCombatants().filter((e: any) => e.isCampaign && !e.isAi))
      this.bots.set(player, this.botFactory.create(player));
    this.updateDebugBotIndex(this.botDebugIndex.value, game);
    let onDebugChange = (v: any) => this.updateDebugBotIndex(v, game);
    this.botDebugIndex.onChange.subscribe(onDebugChange);
    this.disposables.add(() => this.botDebugIndex.onChange.unsubscribe(onDebugChange));
    eventsApi.subscribe((evt: any) => this.bots.forEach((bot) => bot.onGameEvent(evt, this.gameApi)));
    this.disposables.add(eventsApi);
    for (const bot of this.bots.values()) {
      var api = new PlayerApi(
        bot.name,
        this.gameApi,
        // 传入第5个参数 chatSender，使 ActionsApi.sayAll 生效
        new ActionsApi(game, this.actionFactory, this.actionQueue, bot, this.chatSender),
        new ProductionApi(game.getPlayerByName(bot.name).production),
      );
      const loggerApi = new LoggerApi(AppLogger.get(bot.name), this.gameApi);
      bot.setGameApi(this.gameApi);
      bot.setActionsApi(api.actions);
      bot.setProductionApi(api.production);
      bot.setLogger(loggerApi);
      bot.setContext?.(new BotContext(this.gameApi, api, loggerApi));
      bot.onGameInit?.(this.gameApi);
    }
  }

  /** 游戏开始：转发到各 Bot，并同步昵称到 Game/Player。 */
  onGameStart(): void {
    if (!this.gameApi) throw new Error("Bot manager is not initialized");
    for (const bot of this.bots.values()) bot.onGameStart(this.gameApi);
    // 将Bot昵称同步到Game对象和玩家对象，供所有UI层使用
    if (this.bots.size > 0 && this._game) {
      if (!this._game.aiPlayerNicknames) {
        this._game.aiPlayerNicknames = {};
      }
      this.bots.forEach(
        function (this: BotManager, bot: any) {
          var p: any;
          try {
            p = this._game.getPlayerByName(bot.name);
          } catch (_) {}
          // 战役玩家已在 GameFactory 设置 displayName（真实阵营名），
          // 这里统一同步到 aiPlayerNicknames，供 SoundHandler/ScoreTable 等显示。
          var displayName = bot.nickname || (p && p.displayName);
          if (displayName) {
            this._game.aiPlayerNicknames[bot.name] = displayName;
            if (p) p.displayName = displayName;
          }
        }.bind(this),
      );
    }
  }

  /** 每逻辑 tick：执行队列动作、驱动 Bot、flush 并回广播 AI 聊天。 */
  update(game: any): void {
    var action: any;
    var combatant: any;
    for (action of this.actionQueue.dequeueAll()) {
      action.process();
      var printed = action.print();
      if (printed) this.actionLogger.debug(`(${action.player.name})@${game.currentTick}: ` + printed);
    }
    for (combatant of game.getCombatants().filter((e: any) => e.isAi))
      this.bots.get(combatant).onGameTick(this.gameApi);
    // 战役人类阵营的脚本小队 Bot 同样需要每 tick 推进队伍状态
    for (combatant of game.getCombatants().filter((e: any) => e.isCampaign && !e.isAi))
      this.bots.get(combatant).onGameTick(this.gameApi);
    // 自动Flush AI聊天消息到Game队列（单机模式），供GUI层消费
    var chatMsgs = this.flushChatMessages();
    for (var cm = 0; cm < chatMsgs.length; cm++) {
      var msg = chatMsgs[cm];
      // 查找Bot的昵称（bots map key是Player对象，需要遍历匹配name）
      var nickname = msg.playerName;
      this.bots.forEach(function (bot: any) {
        if (bot.name === msg.playerName && bot.nickname) {
          nickname = bot.nickname;
        }
      });
      if (game.aiChatMessages) {
        game.aiChatMessages.push({
          playerName: msg.playerName,
          nickname: nickname,
          text: msg.text,
          time: msg.time,
        });
      }
      // 把AI消息分发给所有Bot（使用昵称作为发送者名）
      this.dispatchChatMessage(nickname, msg.text);
    }
  }

  /** 按调试序号切换各 Bot 的 debug 模式（0 表示关闭）。 */
  updateDebugBotIndex(index: any, game: any): void {
    var player: any;
    var name: any = index > 0 ? game.getAiPlayerName(index) : void 0;
    for (player of this.bots.values()) player.setDebugMode(player.name === name);
  }

  /** 释放：清 GameApi、Bot 表与订阅。 */
  dispose(): void {
    this.gameApi = void 0;
    this.bots.clear();
    this.disposables.dispose();
  }
}
