/**
 * ScenarioTeamBot — 战役脚本小队 Bot。
 *
 * 为战役中没有常规 AI Bot 的阵营（人类玩家）提供脚本小队能力：
 * CreateTeam/DestroyTeam 等触发器动作创建的队伍由 AiApi 招募并执行脚本。
 * 该 Bot 只做队伍管理，不做生产/展开/自主进攻，避免劫持玩家单位。
 *
 * 由 game/bot/campaign/ScenarioTeamBot.ts.js 重写为 TS（行为完全一致）。
 * 两个文件并存期间，本文件才是修改目标：tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */
import { Bot } from "game/bot/Bot"; // 已转换
import { AiApi } from "game/ai/AiApi"; // 已转换

export class ScenarioTeamBot extends Bot {
  /** 场景队伍引擎（懒创建，失败后可重试）。 */
  aiApi: any = null;
  /** 引擎是否已在首个成功 tick 后标记就绪。 */
  initialized: boolean = false;

  /**
   * 确保 AiApi 引擎可用；成功返回 true。
   * @param gameApi 当前 GameApi
   */
  _ensureEngine(gameApi: any): boolean {
    if (this.aiApi) return true;
    try {
      this.aiApi = new AiApi(gameApi, this.actionsApi, this.name, {
        evaluateTriggers: false, // 只执行显式 CreateTeam 队伍，不做自主 AITrigger 评估
      });
      this.aiApi.init();
      console.log(
        "[ScenarioTeamBot] " +
          this.name +
          " scenario team engine initialized (parsed=" +
          !!(this.aiApi.engine && this.aiApi.engine.parsed) +
          ")",
      );
      return true;
    } catch (e) {
      console.warn("[ScenarioTeamBot] init failed for " + this.name + ": " + ((e && e.message) || e));
      return false;
    }
  }

  onGameStart(gameApi: any): void {
    this._ensureEngine(gameApi);
  }

  onGameTick(gameApi: any): void {
    if (!this.initialized) {
      // 首 tick 兜底创建引擎；失败则本 tick 直接返回（下 tick 再试）
      if (!this._ensureEngine(gameApi)) return;
      this.initialized = true;
    }
    try {
      this.aiApi.onTick();
    } catch (_) {}
  }

  /** 不响应聊天（与孪生空实现一致）。 */
  onChatMessage(senderName: any, message: any, gameApi: any) {}
}
