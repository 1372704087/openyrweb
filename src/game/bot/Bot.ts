/**
 * Bot — 所有 AI / 战役脚本 Bot 的抽象基类。
 *
 * 职责：
 *  - 持有 name / country / nickname，并通过 context 访问 game / player 各子 API；
 *  - 提供 setContext 注入，以及 setDebugMode / getDebugMode 调试开关
 *    （调试态会同步到 logger 的 debug level）；
 *  - 定义生命周期钩子：onGameInit / onGameStart / onGameTick / onGameEvent /
 *    onChatMessage，由 BotManager 在对应时机调用；基类默认全部为空实现。
 *
 * 由 game/bot/Bot.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 *
 * 说明：孪生里 debug 标记编译为 WeakMap 私有字段；此处用 ES `#debugMode`，
 * 在 target=es2020 下同样降级为 WeakMap，运行时不可枚举、不可从实例直接读出。
 */

export class Bot {
  /** Bot 名（通常等于玩家名）。 */
  name: any;
  /** 所属国家/阵营名。 */
  country: any;
  /** 显示昵称（可由子类或外部设置，同步到 UI）。 */
  nickname: any;
  /** 由 BotManager.setContext 注入的运行上下文。 */
  context: any;
  /** 调试模式标记（true=向画面输出诊断）。 */
  #debugMode = false;

  /** 当前对局 GameApi（便捷访问）。 */
  get game(): any {
    return this.context?.game;
  }

  /** 当前玩家 PlayerApi。 */
  get player(): any {
    return this.context?.player;
  }

  /** 与 game 相同（兼容命名）。 */
  get gameApi(): any {
    return this.context?.game;
  }

  /** Actions 子 API（orderUnits / placeBuilding 等）。 */
  get actionsApi(): any {
    return this.context?.player.actions;
  }

  /** Production 子 API（队列查询/生产可用性）。 */
  get productionApi(): any {
    return this.context?.player.production;
  }

  /** 日志 API。 */
  get logger(): any {
    return this.context?.logger;
  }

  constructor(name: any, country: any) {
    this.name = name;
    this.country = country;
    this.nickname = "";
  }

  /** 注入上下文，并按当前 debug 标记同步 logger 等级。 */
  setContext(context: any): void {
    this.context = context;
    this.context.logger.setDebugLevel(this.#debugMode);
  }

  /** 兼容旧注入点：单独设置 GameApi（基类空实现，子类可覆盖）。 */
  setGameApi(gameApi: any): void {}

  /** 兼容旧注入点：单独设置 ActionsApi（基类空实现）。 */
  setActionsApi(actionsApi: any): void {}

  /** 兼容旧注入点：单独设置 ProductionApi（基类空实现）。 */
  setProductionApi(productionApi: any): void {}

  /** 兼容旧注入点：单独设置 logger（基类空实现）。 */
  setLogger(logger: any): void {}

  /** 开关调试模式；同步 logger 等级并返回 this（便于链式调用）。 */
  setDebugMode(debugMode: any): this {
    this.#debugMode = debugMode;
    this.context?.logger.setDebugLevel(debugMode);
    return this;
  }

  /** 读取调试模式标记。 */
  getDebugMode(): any {
    return this.#debugMode;
  }

  /** 游戏初始化完成（BotManager.init 末尾调用）。 */
  onGameInit(gameApi: any): void {}

  /** 对局开始。 */
  onGameStart(gameApi: any): void {}

  /** 每逻辑 tick。 */
  onGameTick(gameApi: any): void {}

  /** 游戏事件（广播给所有 Bot）。 */
  onGameEvent(event: any, gameApi: any): void {}

  /**
   * 聊天消息钩子：当收到玩家聊天时由 BotManager 调用。
   * senderName: 发送者名称, message: 消息文本
   */
  onChatMessage(senderName: any, message: any, gameApi: any): void {}
}
