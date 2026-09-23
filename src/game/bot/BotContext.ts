/**
 * BotContext — 单个 Bot 的运行上下文（game / player / logger 三元组）。
 *
 * 由 BotManager.init 构造后经 Bot.setContext 注入，使基类 getter
 * （game / actionsApi / productionApi / logger）无需各子 API 字段拷贝。
 *
 * 由 game/bot/BotContext.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */

export class BotContext {
  /** 当前 GameApi。 */
  game: any;
  /** 当前 PlayerApi（含 actions / production）。 */
  player: any;
  /** 日志 API。 */
  logger: any;

  constructor(game: any, player: any, logger: any) {
    this.game = game;
    this.player = player;
    this.logger = logger;
  }
}
