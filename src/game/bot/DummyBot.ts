/**
 * DummyBot — 遭遇战「简单」档的占位 Bot。
 *
 * 行为极简：
 *  - 开局：按 tickRate/5 计算自身行动节拍，记录非同盟敌方玩家名；
 *  - tick：节拍到点时——Initial 展开基地车 → Deployed 待命 →
 *    无可战单位则判定战败并退出。
 *
 * 由 game/bot/DummyBot.ts.js 重写为 TS（行为完全一致）。两个文件并存期间，
 * 本文件才是修改目标：tools/repack.mjs 打包时优先采用 .ts 模块的编译产物。
 */
import { Bot } from "game/bot/Bot"; // 已转换
import { OrderType } from "game/order/OrderType"; // 已转换

/**
 * DummyBot 内部状态机（模块私有，与孪生一致不对外导出）：
 * 0=开局未展开 → 1=已展开 → 2=进攻中（本实现未迁入）→ 3=战败。
 */
enum DummyBotState {
  /** 等待展开基地车。 */
  Initial = 0,
  /** 基地已展开。 */
  Deployed = 1,
  /** 进攻中（占位，孪生未使用）。 */
  Attacking = 2,
  /** 已战败。 */
  Defeated = 3,
}

export class DummyBot extends Bot {
  /** 当前状态机位置。 */
  botState: DummyBotState = DummyBotState.Initial;
  /** 自身行动节拍（每 N tick 走一次逻辑）。 */
  tickRatio: any;
  /** 非同盟敌方玩家名列表。 */
  enemyPlayers: any;

  /** 计算节拍并收集敌方玩家。 */
  onGameStart(gameApi: any): void {
    var rate = gameApi.getTickRate();
    this.tickRatio = Math.ceil(rate / 5);
    this.enemyPlayers = gameApi
      .getPlayers()
      .filter((p: any) => p !== this.name && !gameApi.areAlliedPlayers(this.name, p));
  }

  onGameTick(gameApi: any): void {
    if (gameApi.getCurrentTick() % this.tickRatio == 0)
      switch (this.botState) {
        case DummyBotState.Initial: {
          const baseUnit = gameApi.getGeneralRules().baseUnit;
          // 已有建造厂 → 视为展开完成
          if (gameApi.getVisibleUnits(this.name, "self", (r: any) => r.constructionYard).length) {
            this.botState = DummyBotState.Deployed;
            break;
          }
          // 否则尝试展开基地车（baseUnit 列表中的单位）
          var mcv = gameApi.getVisibleUnits(this.name, "self", (r: any) => baseUnit.includes(r.name));
          mcv.length && this.actionsApi.orderUnits([mcv[0]], OrderType.DeploySelected);
          break;
        }
        case DummyBotState.Deployed:
          // 已展开：等待 Attacking 迁移（孪生未实现进攻分支）
          break;
        case DummyBotState.Attacking:
          // 无可选择战斗单位 → 判负退出
          gameApi.getVisibleUnits(this.name, "self", (r: any) => r.isSelectableCombatant).length ||
            ((this.botState = DummyBotState.Defeated), this.actionsApi.quitGame());
      }
  }
}
