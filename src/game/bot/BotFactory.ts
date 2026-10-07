/**
 * BotFactory — 按玩家类型与 AI 难度创建对应 Bot 实例。
 *
 * 遭遇战 AI 现状：原版 AI 移植（OriginalAiBot）判定为失败品，已整体屏蔽——
 * 全部难度档位暂回落 DummyBot 占位（展开基地后待机）。其代码与模块登记
 * （game/bot/original/、_module-map.json、ts-parity）均保留在仓，仅运行时不可达；
 * BotsLib 的导出也未摘除。
 *
 * ⚠️ AiDifficulty 的数值同时被当作「难度档位索引」硬编码在别的模块里
 *   （0=最难 / 1=中 / 2=易，见 Game.ts:377、ReturnOreTask:184、
 *   SlaveGatherTask:504、SlaveMinerVehicleTrait:318）。
 *   因此 AiDifficulty 的成员与数值一律不得增删或重排。
 *   Brutal(0) / Easy_Custom(6) / Medium_Custom(7) 等槽位历经
 *   custom-ai / OriginalAiBot 两代承载者，数值槽位始终保留不动，
 *   将来接新 Bot 时只需在对应 case 恢复分档。
 *
 * 战役：电脑/人类阵营统一 → ScenarioTeamBot（仅脚本小队引擎）。
 *
 * 由 game/bot/BotFactory.ts.js 重写为 TS。tools/repack.mjs 打包时优先采用
 * .ts 模块的编译产物。
 */
import { AiDifficulty } from "game/gameopts/GameOpts"; // 已转换
import { DummyBot } from "game/bot/DummyBot"; // 已转换
import { ScenarioTeamBot } from "game/bot/campaign/ScenarioTeamBot"; // 已转换

export class BotFactory {
  /** 预留：可注入 Bot 装配库（当前构造后未再读取，与孪生一致）。 */
  botsLib: any;

  constructor(botsLib: any) {
    this.botsLib = botsLib;
  }

  /**
   * 为一名战斗成员创建 Bot。
   * @param player 含 isAi / isCampaign / aiDifficulty / name / country 的玩家信息
   */
  create(player: any): any {
    // 战役人类阵营没有常规 AI，但需要脚本小队引擎
    // （CreateTeam 等触发器动作对任意阵营都可用，参考临时源码 scenarioTeamRuntime）。
    if (!player.isAi) {
      if (player.isCampaign) return new ScenarioTeamBot(player.name, player.country.name);
      throw new Error(`Player "${player.name}" is not an AI`);
    }
    // 战役 AI 不使用遭遇战 AI（OriginalAiBot / IraqBot 等），
    // 统一使用 ScenarioTeamBot —— 只执行地图/触发器创建的脚本小队，不做自主生产与进攻。
    if (player.isCampaign) return new ScenarioTeamBot(player.name, player.country.name);
    // OriginalAiBot 已屏蔽（失败品，代码留在 game/bot/original/）：遭遇战全档位
    // 回落 DummyBot 占位。难度数值槽位按上面的 ⚠️ 保留，接新 Bot 时恢复分档。
    switch (player.aiDifficulty) {
      case AiDifficulty.Easy:
      case AiDifficulty.Easy_Ori:
      case AiDifficulty.Easy_Custom:
      case AiDifficulty.Medium:
      case AiDifficulty.Medium_Ori:
      case AiDifficulty.Medium_Custom:
      case AiDifficulty.Brutal:
      case AiDifficulty.Brutal_Ori:
        return new DummyBot(player.name, player.country.name);
      default:
        throw new Error(`Unsupported AI difficulty "${player.aiDifficulty}"`);
    }
  }
}
